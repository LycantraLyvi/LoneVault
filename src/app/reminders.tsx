// Importa os componentes necessários para montar a tela.
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

// Importa o seletor de horário do aparelho.
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

// Importa o armazenamento local do aplicativo.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importa as ferramentas de notificações locais.
import * as Notifications from "expo-notifications";

// Importa os recursos do React para controlar a tela.
import { useEffect, useState } from "react";

// Chave usada para guardar as configurações dos lembretes.
const STORAGE_KEY = "@lonevault:reminders";

// Chave usada para guardar os IDs das notificações agendadas.
const NOTIFICATION_IDS_KEY = "@lonevault:reminder-notification-ids";

// Lista dos dias da semana.
// O número segue o padrão do Expo: domingo = 1 e sábado = 7.
const WEEKDAYS = [
  { label: "Dom", value: 1 },
  { label: "Seg", value: 2 },
  { label: "Ter", value: 3 },
  { label: "Qua", value: 4 },
  { label: "Qui", value: 5 },
  { label: "Sex", value: 6 },
  { label: "Sáb", value: 7 },
];

// Define o formato das configurações que serão salvas.
type ReminderSettings = {
  enabled: boolean;
  weekdays: number[];
  hour: number;
  minute: number;
};

// Define o formato padrão das configurações.
const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  weekdays: [2, 3, 4, 5, 6],
  hour: 9,
  minute: 0,
};

// Tela de configuração dos lembretes.
export default function RemindersScreen() {
  // Guarda se os lembretes estão ativados.
  const [enabled, setEnabled] = useState(DEFAULT_SETTINGS.enabled);

  // Guarda os dias da semana selecionados.
  const [weekdays, setWeekdays] = useState<number[]>(DEFAULT_SETTINGS.weekdays);

  // Guarda o horário escolhido.
  const [time, setTime] = useState(() => {
    const initialTime = new Date();

    // Define o horário inicial para 09:00.
    initialTime.setHours(9, 0, 0, 0);

    return initialTime;
  });

  // Controla a exibição do seletor de horário.
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Indica se as configurações estão sendo carregadas ou salvas.
  const [loading, setLoading] = useState(true);

  // Carrega as configurações salvas quando a tela é aberta.
  useEffect(() => {
    async function loadSettings() {
      try {
        // Busca as configurações no armazenamento local.
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);

        // Se houver configurações salvas, restaura os valores.
        if (savedSettings) {
          const parsed: ReminderSettings = JSON.parse(savedSettings);

          setEnabled(parsed.enabled);
          setWeekdays(parsed.weekdays);

          // Cria uma data com o horário que foi salvo.
          const savedTime = new Date();
          savedTime.setHours(parsed.hour, parsed.minute, 0, 0);

          setTime(savedTime);
        }
      } catch (error) {
        // Informa se não foi possível carregar as configurações.
        console.error("Erro ao carregar lembretes:", error);

        Alert.alert(
          "Erro",
          "Não foi possível carregar as configurações dos lembretes.",
        );
      } finally {
        // Libera a tela após terminar o carregamento.
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Adiciona ou remove um dia da lista selecionada.
  function toggleWeekday(day: number) {
    setWeekdays((currentDays) => {
      // Se o dia já estiver selecionado, remove-o.
      if (currentDays.includes(day)) {
        return currentDays.filter((currentDay) => currentDay !== day);
      }

      // Caso contrário, adiciona o dia à lista.
      return [...currentDays, day].sort((a, b) => a - b);
    });
  }

  // Recebe o horário escolhido no seletor do aparelho.
  function handleTimeChange(event: DateTimePickerEvent, selectedTime?: Date) {
    // No Android, o seletor fecha após a escolha ou cancelamento.
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    // Atualiza o horário somente se a pessoa confirmou uma escolha.
    if (event.type === "set" && selectedTime) {
      setTime(selectedTime);
    }
  }

  // Cancela somente as notificações criadas por esta tela.
  async function cancelReminderNotifications() {
    try {
      // Recupera os IDs das notificações que este recurso agendou.
      const savedIds = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);

      if (savedIds) {
        const ids: string[] = JSON.parse(savedIds);

        // Cancela cada notificação individualmente.
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }

      // Apaga a lista de IDs antigos.
      await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    } catch (error) {
      // Registra o erro sem cancelar notificações de outras funções.
      console.error("Erro ao cancelar lembretes:", error);

      throw error;
    }
  }

  // Salva as configurações e agenda as notificações.
  async function saveReminders() {
    // Evita salvar enquanto os dados ainda estão carregando.
    if (loading) {
      return;
    }

    // Não permite ativar lembretes sem escolher dias.
    if (enabled && weekdays.length === 0) {
      Alert.alert("Escolha os dias", "Selecione pelo menos um dia da semana.");
      return;
    }

    try {
      // Guarda as configurações atuais no aparelho.
      const settings: ReminderSettings = {
        enabled,
        weekdays,
        hour: time.getHours(),
        minute: time.getMinutes(),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      // Remove os agendamentos anteriores deste recurso.
      await cancelReminderNotifications();

      // Se estiver desativado, não cria novos agendamentos.
      if (!enabled) {
        Alert.alert(
          "Lembretes desativados",
          "Suas configurações foram salvas e os lembretes foram desativados.",
        );
        return;
      }

      // Solicita permissão para enviar notificações.
      let permission = await Notifications.getPermissionsAsync();

      // Se ainda não houver permissão, solicita ao usuário.
      if (!permission.granted) {
        permission = await Notifications.requestPermissionsAsync();
      }

      // Se a permissão não foi concedida, informa a pessoa.
      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Permita as notificações nas configurações do aparelho para receber seus lembretes.",
        );
        return;
      }

      // Cria um canal de notificações no Android.
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("lonevault-reminders", {
          name: "Lembretes do LoneVault",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }

      // Guarda os identificadores dos novos agendamentos.
      const newNotificationIds: string[] = [];

      // Cria uma notificação recorrente para cada dia escolhido.
      for (const day of weekdays) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            // Título que aparece na notificação.
            title: "Hora do seu desafio! 🐺",

            // Mensagem exibida abaixo do título.
            body: "Reserve um momento para continuar sua jornada no LoneVault.",

            // Define o canal criado no Android.
            ...(Platform.OS === "android"
              ? { channelId: "lonevault-reminders" }
              : {}),
          },

          // Define a repetição semanal no dia e horário escolhidos.
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day,
            hour: time.getHours(),
            minute: time.getMinutes(),
          },
        });

        // Guarda o ID para poder cancelar esse agendamento depois.
        newNotificationIds.push(id);
      }

      // Salva os IDs para que possamos editar ou cancelar os lembretes.
      await AsyncStorage.setItem(
        NOTIFICATION_IDS_KEY,
        JSON.stringify(newNotificationIds),
      );

      // Confirma que o agendamento foi concluído.
      Alert.alert(
        "Lembretes salvos! 🐺",
        "Seus lembretes foram configurados com sucesso.",
      );
    } catch (error) {
      // Registra detalhes técnicos para ajudar a encontrar problemas.
      console.error("Erro ao salvar lembretes:", error);

      Alert.alert(
        "Não foi possível salvar",
        "Ocorreu um erro ao configurar os lembretes. Tente novamente.",
      );
    }
  }

  // Transforma o horário em um texto como 09:00.
  const formattedTime = `${String(time.getHours()).padStart(2, "0")}:${String(
    time.getMinutes(),
  ).padStart(2, "0")}`;

  return (
    // Permite rolar a tela em aparelhos menores.
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Título e descrição da tela. */}
      <Text style={styles.title}>Lembretes</Text>

      <Text style={styles.subtitle}>
        Mantenha sua jornada em movimento. Escolha quando o LoneVault deve
        lembrar você.
      </Text>

      {/* Cartão principal que liga ou desliga os lembretes. */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.cardTitle}>Lembretes semanais</Text>

            <Text style={styles.description}>
              {enabled
                ? "Seus lembretes estão ativados."
                : "Seus lembretes estão desativados."}
            </Text>
          </View>

          {/* Controle para ativar ou desativar os lembretes. */}
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{
              false: "#315B43",
              true: "#42D780",
            }}
            thumbColor={enabled ? "#FFFFFF" : "#E8F5EC"}
          />
        </View>
      </View>

      {/* Cartão para escolher os dias da semana. */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dias da semana</Text>

        <Text style={styles.description}>
          Selecione um ou mais dias para receber o lembrete.
        </Text>

        {/* Mostra um botão para cada dia da semana. */}
        <View style={styles.daysContainer}>
          {WEEKDAYS.map((day) => {
            // Verifica se este dia está selecionado.
            const selected = weekdays.includes(day.value);

            return (
              <Pressable
                key={day.value}
                onPress={() => toggleWeekday(day.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={day.label}
                style={[styles.dayButton, selected && styles.dayButtonSelected]}
              >
                <Text
                  style={[styles.dayText, selected && styles.dayTextSelected]}
                >
                  {day.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Cartão para escolher o horário. */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Horário</Text>

        <Text style={styles.description}>
          Escolha a hora em que deseja ser lembrado.
        </Text>

        {/* Abre o seletor nativo de horário. */}
        <Pressable
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`Escolher horário. Atual: ${formattedTime}`}
        >
          <Text style={styles.timeText}>{formattedTime}</Text>

          <Text style={styles.changeTimeText}>Alterar horário</Text>
        </Pressable>

        {/* Exibe o seletor de horário quando solicitado. */}
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleTimeChange}
          />
        )}

        {/* No iOS, oferece um botão para fechar o seletor. */}
        {Platform.OS === "ios" && showTimePicker && (
          <Pressable
            style={styles.closePickerButton}
            onPress={() => setShowTimePicker(false)}
          >
            <Text style={styles.closePickerText}>Confirmar horário</Text>
          </Pressable>
        )}
      </View>

      {/* Botão que salva e aplica as configurações. */}
      <Pressable
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={saveReminders}
        disabled={loading}
        accessibilityRole="button"
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Carregando..." : "Salvar lembretes"}
        </Text>
      </Pressable>

      {/* Explica como os lembretes funcionam. */}
      <Text style={styles.footerText}>
        Os lembretes são programados neste aparelho. Para recebê-los, mantenha
        as notificações do LoneVault permitidas nas configurações do sistema.
      </Text>
    </ScrollView>
  );
}

// Define a aparência da tela e dos seus componentes.
const styles = StyleSheet.create({
  // Fundo principal da tela.
  container: {
    flex: 1,
    backgroundColor: "#07130F",
  },

  // Espaçamento interno da tela.
  content: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  // Título principal.
  title: {
    color: "#E8F5EC",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
  },

  // Texto abaixo do título.
  subtitle: {
    color: "#A8C4B1",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Cartão que agrupa cada conjunto de configurações.
  card: {
    backgroundColor: "#10241B",
    borderColor: "#315B43",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  // Linha que organiza o texto e o botão de ativação.
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  // Permite que a parte textual ocupe o espaço disponível.
  switchTextContainer: {
    flex: 1,
  },

  // Título de cada cartão.
  cardTitle: {
    color: "#E8F5EC",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
  },

  // Texto explicativo dos cartões.
  description: {
    color: "#A8C4B1",
    fontSize: 14,
    lineHeight: 20,
  },

  // Organiza os botões dos dias em uma linha flexível.
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },

  // Aparência de um dia ainda não selecionado.
  dayButton: {
    minWidth: 38,
    height: 42,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#315B43",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07130F",
  },

  // Aparência do dia selecionado.
  dayButtonSelected: {
    backgroundColor: "#42D780",
    borderColor: "#42D780",
  },

  // Texto de um dia não selecionado.
  dayText: {
    color: "#E8F5EC",
    fontSize: 13,
    fontWeight: "600",
  },

  // Texto do dia selecionado.
  dayTextSelected: {
    color: "#07130F",
  },

  // Botão que abre o seletor de horário.
  timeButton: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#315B43",
    backgroundColor: "#07130F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Horário em destaque.
  timeText: {
    color: "#42D780",
    fontSize: 28,
    fontWeight: "bold",
  },

  // Texto que indica que o horário pode ser alterado.
  changeTimeText: {
    color: "#A8C4B1",
    fontSize: 13,
  },

  // Botão de confirmação do seletor no iOS.
  closePickerButton: {
    alignSelf: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  // Texto do botão de confirmação.
  closePickerText: {
    color: "#42D780",
    fontSize: 15,
    fontWeight: "bold",
  },

  // Botão principal para salvar.
  saveButton: {
    backgroundColor: "#42D780",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  // Aparência do botão enquanto a tela carrega.
  saveButtonDisabled: {
    opacity: 0.6,
  },

  // Texto do botão de salvar.
  saveButtonText: {
    color: "#07130F",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Aviso no final da tela.
  footerText: {
    color: "#789985",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 18,
  },
});
