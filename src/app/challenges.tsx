// Importa o hook que permite guardar e atualizar informações da tela.
import { useEffect, useState } from "react";
// Permite guardar os desafios no aparelho, mesmo depois de fechar o app.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importa os componentes necessários para montar a interface.
import {
  Modal, // Cria janelas personalizadas sobre a tela.
  Pressable, // Cria botões que podem ser pressionados.
  ScrollView, // Permite rolar o conteúdo da tela.
  StyleSheet, // Organiza os estilos visuais.
  Text, // Exibe textos.
  TextInput, // Permite digitar informações.
  View, // Agrupa outros componentes visuais.
} from "react-native";

// Define as informações que cada desafio precisa guardar.
type Challenge = {
  id: string; // Identificador único do desafio.
  name: string; // Nome escolhido pelo usuário.
  totalDays: number; // Quantidade total de dias.
  completedDays: number[]; // Dias que já foram concluídos.
};

// Define as informações necessárias para cada botão do modal.
type ModalAction = {
  text: string; // Texto que aparece no botão.
  onPress?: () => void; // Ação executada ao pressionar o botão.
  destructive?: boolean; // Indica uma ação perigosa, como excluir.
  primary?: boolean; // Indica que o botão deve receber destaque.
};

// Define a quantidade máxima de dias permitida.
const MAX_DAYS = 3650;

// Nome usado para encontrar os desafios salvos no armazenamento do aparelho.
const STORAGE_KEY = "@lonevault:challenges";

// Define a tela de desafios do LoneVault.
export default function ChallengesScreen() {
  // Guarda todos os desafios criados pelo usuário.
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Indica se já tentamos carregar os dados salvos.
  // Isso evita salvar a lista vazia antes de terminar o carregamento.
  const [storageReady, setStorageReady] = useState(false);

  // Carrega os desafios salvos assim que a tela é aberta.
  useEffect(() => {
    async function loadChallenges() {
      try {
        // Busca no aparelho os dados guardados anteriormente.
        const savedChallenges = await AsyncStorage.getItem(STORAGE_KEY);

        // Se houver dados, transforma o texto JSON novamente em uma lista.
        if (savedChallenges) {
          const parsedChallenges: unknown = JSON.parse(savedChallenges);

          // Confere se o conteúdo salvo é uma lista antes de usá-lo.
          if (Array.isArray(parsedChallenges)) {
            setChallenges(parsedChallenges as Challenge[]);
          }
        }
      } catch (error) {
        // Se houver problema ao ler os dados, mantém a tela funcionando.
        console.error("Não foi possível carregar os desafios:", error);
      } finally {
        // Libera o salvamento depois que a leitura terminar.
        setStorageReady(true);
      }
    }

    loadChallenges();
  }, []);

  // Salva a lista sempre que os desafios mudarem, após o carregamento inicial.
  useEffect(() => {
    if (!storageReady) {
      return;
    }

    async function saveChallenges() {
      try {
        // Converte a lista em texto para o AsyncStorage conseguir guardá-la.
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
      } catch (error) {
        // Registra o erro para facilitar a identificação de problemas.
        console.error("Não foi possível salvar os desafios:", error);
      }
    }

    saveChallenges();
  }, [challenges, storageReady]);

  // Guarda o nome digitado para o novo desafio.
  const [newName, setNewName] = useState("");

  // Guarda a duração digitada para o novo desafio.
  const [newDuration, setNewDuration] = useState("30");

  // Guarda o ID do desafio que está aberto.
  // Quando é null, a tela mostra a lista de desafios.
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null,
  );

  // Controla se a janela personalizada está visível.
  const [modalVisible, setModalVisible] = useState(false);

  // Guarda o título exibido na janela.
  const [modalTitle, setModalTitle] = useState("");

  // Guarda a mensagem exibida na janela.
  const [modalMessage, setModalMessage] = useState("");

  // Guarda os botões que aparecem na janela.
  const [modalActions, setModalActions] = useState<ModalAction[]>([]);

  // Converte a duração digitada em um número.
  const parsedDuration = Number.parseInt(newDuration, 10);

  // Verifica se a duração está dentro do limite permitido.
  const validDuration =
    Number.isFinite(parsedDuration) &&
    parsedDuration >= 1 &&
    parsedDuration <= MAX_DAYS;

  // Procura o desafio que está selecionado.
  const selectedChallenge = challenges.find(
    (challenge) => challenge.id === selectedChallengeId,
  );

  // Abre uma janela personalizada com título, mensagem e botões.
  function showModal(
    title: string,
    message: string,
    actions: ModalAction[] = [{ text: "Entendi", primary: true }],
  ) {
    // Atualiza o título da janela.
    setModalTitle(title);

    // Atualiza a mensagem da janela.
    setModalMessage(message);

    // Define quais botões serão exibidos.
    setModalActions(actions);

    // Torna a janela visível.
    setModalVisible(true);
  }

  // Fecha a janela personalizada.
  function closeModal() {
    setModalVisible(false);
  }

  // Formata um número como moeda brasileira.
  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Calcula a soma de todos os valores de um desafio.
  // Exemplo: 1 + 2 + 3 + 4 + 5 = 15.
  function calculateGoal(totalDays: number) {
    return (totalDays * (totalDays + 1)) / 2;
  }

  // Soma os valores dos dias que já foram concluídos.
  function calculateSaved(completedDays: number[]) {
    return completedDays.reduce((sum, day) => sum + day, 0);
  }

  // Calcula a porcentagem de conclusão do desafio.
  function calculateProgress(challenge: Challenge) {
    return Math.round(
      (challenge.completedDays.length / challenge.totalDays) * 100,
    );
  }

  // Cria um novo desafio.
  function createChallenge() {
    // Remove espaços desnecessários do início e do fim do nome.
    const name = newName.trim();

    // Impede a criação de um desafio sem nome.
    if (!name) {
      showModal(
        "Nome obrigatório",
        "Digite um nome para o seu desafio antes de continuar.",
      );

      return;
    }

    // Impede a criação de um desafio com duração inválida.
    if (!validDuration) {
      showModal(
        "Duração inválida",
        `Escolha uma duração entre 1 e ${MAX_DAYS} dias.`,
      );

      return;
    }

    // Monta o novo desafio com o progresso inicialmente vazio.
    const newChallenge: Challenge = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      totalDays: parsedDuration,
      completedDays: [],
    };

    // Adiciona o novo desafio sem apagar os anteriores.
    setChallenges((previous) => [...previous, newChallenge]);

    // Limpa os campos para facilitar a criação de outro desafio.
    setNewName("");
    setNewDuration("30");

    // Mostra uma janela personalizada confirmando a criação.
    showModal(
      "Desafio criado!",
      `O desafio "${name}" foi criado com ${parsedDuration} dias.`,
      [
        {
          text: "Acessar desafio",
          primary: true,

          // Abre o desafio que acabou de ser criado.
          onPress: () => {
            setSelectedChallengeId(newChallenge.id);
          },
        },
        {
          text: "Continuar na lista",

          // Não precisa executar nenhuma ação adicional.
          // A janela será fechada pelo botão.
          onPress: () => {},
        },
      ],
    );
  }

  // Marca ou desmarca um dia de um desafio.
  function toggleDay(challengeId: string, day: number) {
    // Atualiza a lista de desafios.
    setChallenges((previous) =>
      previous.map((challenge) => {
        // Mantém os outros desafios sem alterações.
        if (challenge.id !== challengeId) {
          return challenge;
        }

        // Verifica se o dia já foi concluído.
        const alreadyCompleted = challenge.completedDays.includes(day);

        // Se já foi concluído, remove o dia.
        // Caso contrário, adiciona o dia à lista.
        const updatedDays = alreadyCompleted
          ? challenge.completedDays.filter(
              (completedDay) => completedDay !== day,
            )
          : [...challenge.completedDays, day].sort((a, b) => a - b);

        // Retorna o desafio com o progresso atualizado.
        return {
          ...challenge,
          completedDays: updatedDays,
        };
      }),
    );
  }

  // Solicita confirmação antes de excluir um desafio.
  function deleteChallenge(challenge: Challenge) {
    // Exibe uma janela com as opções de cancelar ou excluir.
    showModal(
      "Excluir desafio",
      `Deseja excluir "${challenge.name}" e todo o progresso dele?`,
      [
        {
          text: "Cancelar",

          // Fecha a janela sem excluir o desafio.
          onPress: () => {},
        },
        {
          text: "Excluir",
          destructive: true,

          // Só executa a exclusão quando o usuário confirma.
          onPress: () => {
            // Remove somente o desafio escolhido.
            setChallenges((previous) =>
              previous.filter((item) => item.id !== challenge.id),
            );

            // Se o desafio excluído estava aberto,
            // retorna automaticamente para a lista.
            setSelectedChallengeId((currentId) =>
              currentId === challenge.id ? null : currentId,
            );
          },
        },
      ],
    );
  }

  // Monta um cartão resumido para cada desafio da lista.
  function renderChallengeCard(challenge: Challenge) {
    // Calcula o dinheiro guardado até agora.
    const saved = calculateSaved(challenge.completedDays);

    // Calcula a meta total do desafio.
    const goal = calculateGoal(challenge.totalDays);

    // Calcula a porcentagem de progresso.
    const progress = calculateProgress(challenge);

    // Conta quantos dias foram concluídos.
    const completedCount = challenge.completedDays.length;

    return (
      <View key={challenge.id} style={styles.challengeCard}>
        {/* Mostra o nome, a duração e o botão de exclusão. */}
        <View style={styles.challengeHeader}>
          <View style={styles.challengeHeading}>
            <Text style={styles.challengeName}>{challenge.name}</Text>

            <Text style={styles.challengeDuration}>
              {challenge.totalDays} dias
            </Text>
          </View>

          {/* Abre a confirmação para excluir este desafio. */}
          <Pressable
            onPress={() => deleteChallenge(challenge)}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel={`Excluir desafio ${challenge.name}`}
          >
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </Pressable>
        </View>

        {/* Mostra o resumo financeiro do desafio. */}
        <View style={styles.moneyBox}>
          <Text style={styles.moneyLabel}>Total guardado</Text>

          <Text style={styles.savedAmount}>{formatCurrency(saved)}</Text>

          {/* Mostra o valor total que pode ser acumulado. */}
          <View style={styles.summaryRow}>
            <Text style={styles.moneyLabel}>Meta total</Text>

            <Text style={styles.moneyValue}>{formatCurrency(goal)}</Text>
          </View>

          {/* Mostra quantos dias já foram concluídos. */}
          <View style={styles.summaryRow}>
            <Text style={styles.moneyLabel}>Dias concluídos</Text>

            <Text style={styles.moneyValue}>
              {completedCount} de {challenge.totalDays}
            </Text>
          </View>

          {/* Desenha a barra de progresso. */}
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          {/* Exibe a porcentagem de conclusão. */}
          <Text style={styles.progressText}>{progress}% concluído</Text>
        </View>

        {/* Abre a tela individual do desafio. */}
        <Pressable
          style={styles.openButton}
          onPress={() => setSelectedChallengeId(challenge.id)}
          accessibilityRole="button"
          accessibilityLabel={`Acessar desafio ${challenge.name}`}
        >
          <Text style={styles.openButtonText}>Acessar desafio</Text>
        </Pressable>
      </View>
    );
  }

  // Monta a tela detalhada de um desafio.
  function renderSelectedChallenge(challenge: Challenge) {
    // Calcula os dados financeiros e o progresso.
    const saved = calculateSaved(challenge.completedDays);
    const goal = calculateGoal(challenge.totalDays);
    const progress = calculateProgress(challenge);
    const completedCount = challenge.completedDays.length;

    // Verifica se todos os dias foram concluídos.
    const isCompleted = completedCount === challenge.totalDays;

    return (
      <>
        {/* Botão para retornar à lista de desafios. */}
        <Pressable
          style={styles.backButton}
          onPress={() => setSelectedChallengeId(null)}
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>← Voltar aos desafios</Text>
        </Pressable>

        {/* Mostra o nome do desafio aberto. */}
        <Text style={styles.title}>{challenge.name}</Text>

        {/* Explica a duração e como marcar os dias. */}
        <Text style={styles.subtitle}>
          Desafio de {challenge.totalDays} dias. Escolha os dias que deseja
          concluir, em qualquer ordem.
        </Text>

        {/* Mostra o resumo financeiro detalhado. */}
        <View style={styles.moneyBox}>
          <Text style={styles.moneyLabel}>Total guardado</Text>

          <Text style={styles.savedAmount}>{formatCurrency(saved)}</Text>

          {/* Mostra a meta total. */}
          <View style={styles.summaryRow}>
            <Text style={styles.moneyLabel}>Meta total</Text>

            <Text style={styles.moneyValue}>{formatCurrency(goal)}</Text>
          </View>

          {/* Mostra a quantidade de dias concluídos. */}
          <View style={styles.summaryRow}>
            <Text style={styles.moneyLabel}>Dias concluídos</Text>

            <Text style={styles.moneyValue}>
              {completedCount} de {challenge.totalDays}
            </Text>
          </View>

          {/* Barra visual que representa o progresso. */}
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          {/* Porcentagem concluída. */}
          <Text style={styles.progressText}>{progress}% concluído</Text>
        </View>

        {/* Explica a regra de valores do desafio. */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como funciona?</Text>

          <Text style={styles.infoText}>
            O valor é igual ao número do dia: Dia 1 vale R$ 1, Dia 2 vale R$ 2,
            e assim por diante. Você pode pular dias e concluir os que quiser.
          </Text>
        </View>

        {/* Título da grade de dias. */}
        <Text style={styles.daysTitle}>Dias do desafio</Text>

        {/* Cria um botão para cada dia do desafio. */}
        <View style={styles.daysGrid}>
          {Array.from(
            { length: challenge.totalDays },
            (_, index) => index + 1,
          ).map((day) => {
            // Verifica se este dia já foi concluído.
            const completed = challenge.completedDays.includes(day);

            return (
              <Pressable
                key={day}
                onPress={() => toggleDay(challenge.id, day)}
                accessibilityRole="button"
                accessibilityLabel={
                  `Dia ${day}, ${formatCurrency(day)}, ` +
                  (completed ? "concluído" : "não concluído")
                }
                accessibilityState={{ selected: completed }}
                style={[styles.dayCard, completed && styles.dayCardCompleted]}
              >
                {/* Mostra o número do dia. */}
                <Text
                  style={[styles.dayNumber, completed && styles.completedText]}
                >
                  Dia {day}
                </Text>

                {/* Mostra o valor correspondente ao dia. */}
                <Text
                  style={[styles.dayAmount, completed && styles.completedText]}
                >
                  {formatCurrency(day)}
                </Text>

                {/* Indica se o dia está concluído. */}
                <Text
                  style={[styles.dayStatus, completed && styles.completedText]}
                >
                  {completed ? "✓ Feito" : "Selecionar"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Mostra uma mensagem quando todos os dias foram feitos. */}
        {isCompleted && (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Desafio concluído!</Text>

            <Text style={styles.successText}>
              Você completou todos os dias de "{challenge.name}" e atingiu a
              meta de {formatCurrency(goal)}.
            </Text>
          </View>
        )}

        {/* Botão para excluir o desafio que está aberto. */}
        <Pressable
          style={styles.deleteFullButton}
          onPress={() => deleteChallenge(challenge)}
          accessibilityRole="button"
        >
          <Text style={styles.deleteFullButtonText}>Excluir este desafio</Text>
        </Pressable>
      </>
    );
  }

  // Monta a interface principal da tela.
  return (
    <>
      {/* Área rolável que contém o conteúdo da tela. */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Se um desafio estiver selecionado, mostra os detalhes. */}
        {selectedChallenge ? (
          renderSelectedChallenge(selectedChallenge)
        ) : (
          // Caso contrário, mostra a lista e o formulário.
          <>
            {/* Título principal da tela. */}
            <Text style={styles.title}>Meus desafios</Text>

            <Text style={styles.subtitle}>
              Crie desafios de economia e acompanhe cada um separadamente.
            </Text>

            {/* Formulário para criar novos desafios. */}
            <View style={styles.createCard}>
              <Text style={styles.sectionTitle}>+ Criar desafio</Text>

              {/* Campo para digitar o nome. */}
              <Text style={styles.inputLabel}>Nome do desafio</Text>

              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Ex.: Viagem, celular, reserva..."
                placeholderTextColor="#789084"
                maxLength={50}
              />

              {/* Campo para informar a duração. */}
              <Text style={styles.inputLabel}>Duração em dias</Text>

              <TextInput
                style={styles.input}
                value={newDuration}
                onChangeText={(value) =>
                  setNewDuration(value.replace(/[^0-9]/g, ""))
                }
                keyboardType="number-pad"
                placeholder="Ex.: 30"
                placeholderTextColor="#789084"
                maxLength={4}
              />

              {/* Mostra a meta calculada antes de criar o desafio. */}
              {validDuration && (
                <Text style={styles.goalPreview}>
                  Meta total: {formatCurrency(calculateGoal(parsedDuration))}
                </Text>
              )}

              {/* Botão que cria o desafio. */}
              <Pressable
                style={styles.createButton}
                onPress={createChallenge}
                accessibilityRole="button"
              >
                <Text style={styles.createButtonText}>Criar desafio</Text>
              </Pressable>
            </View>

            {/* Mostra uma mensagem quando ainda não há desafios. */}
            {challenges.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  Nenhum desafio por enquanto
                </Text>

                <Text style={styles.emptyText}>
                  Crie seu primeiro desafio acima. Ele aparecerá aqui para você
                  acessar quando quiser.
                </Text>
              </View>
            ) : (
              <>
                {/* Informa quantos desafios existem. */}
                <Text style={styles.sectionTitle}>
                  Seus desafios ({challenges.length})
                </Text>

                {/* Desenha um cartão para cada desafio criado. */}
                {challenges.map(renderChallengeCard)}
              </>
            )}
          </>
        )}

        {/* Aviso sobre as limitações desta versão do aplicativo. */}
        <Text style={styles.footer}>
          Os valores são registros simulados. Esta versão não movimenta dinheiro
          real. Seus desafios ficam salvos neste aparelho mesmo após fechar o
          aplicativo.
        </Text>
      </ScrollView>

      {/* Modal personalizado para avisos e confirmações. */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        {/* Fundo escuro atrás da janela. */}
        <View style={styles.modalOverlay}>
          {/* Cartão que contém o título, a mensagem e os botões. */}
          <View style={styles.modalCard}>
            {/* Título da janela. */}
            <Text style={styles.modalTitle}>{modalTitle}</Text>

            {/* Mensagem explicativa da janela. */}
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            {/* Organiza os botões da janela. */}
            <View style={styles.modalActions}>
              {modalActions.map((action, index) => (
                <Pressable
                  key={`${action.text}-${index}`}
                  style={[
                    styles.modalButton,

                    // Aplica destaque ao botão principal.
                    action.primary && styles.modalButtonPrimary,

                    // Aplica cor de alerta ao botão destrutivo.
                    action.destructive && styles.modalButtonDestructive,
                  ]}
                  onPress={() => {
                    // Fecha a janela antes de executar a ação.
                    closeModal();

                    // Executa a ação do botão, se existir.
                    action.onPress?.();
                  }}
                  accessibilityRole="button"
                >
                  {/* Texto que aparece no botão. */}
                  <Text
                    style={[
                      styles.modalButtonText,

                      // Ajusta a cor do texto dos botões destacados.
                      (action.primary || action.destructive) &&
                        styles.modalButtonTextEmphasis,
                    ]}
                  >
                    {action.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Define as cores, dimensões e estilos visuais da tela.
const styles = StyleSheet.create({
  // Fundo principal da tela.
  container: {
    flex: 1,
    backgroundColor: "#07130F",
  },

  // Espaçamento interno do conteúdo.
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Título principal.
  title: {
    color: "#E8F5EC",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  // Texto explicativo abaixo do título.
  subtitle: {
    color: "#9CB4A5",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },

  // Cartão do formulário de criação.
  createCard: {
    backgroundColor: "#10241B",
    borderWidth: 1,
    borderColor: "#315B43",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },

  // Título de uma seção.
  sectionTitle: {
    color: "#72E6A0",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 18,
  },

  // Rótulos dos campos de texto.
  inputLabel: {
    color: "#C3D8CA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  // Aparência dos campos de texto.
  input: {
    backgroundColor: "#07130F",
    borderWidth: 1,
    borderColor: "#315B43",
    borderRadius: 12,
    color: "#E8F5EC",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
  },

  // Prévia da meta total.
  goalPreview: {
    color: "#72E6A0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
  },

  // Botão principal de criação.
  createButton: {
    backgroundColor: "#42D780",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 2,
  },

  // Texto do botão de criação.
  createButtonText: {
    color: "#07130F",
    fontSize: 15,
    fontWeight: "bold",
  },

  // Cartão da mensagem de lista vazia.
  emptyCard: {
    backgroundColor: "#10241B",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  // Título da mensagem de lista vazia.
  emptyTitle: {
    color: "#E8F5EC",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },

  // Texto da mensagem de lista vazia.
  emptyText: {
    color: "#9CB4A5",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  // Cartão resumido de cada desafio.
  challengeCard: {
    backgroundColor: "#0C1D15",
    borderWidth: 1,
    borderColor: "#244635",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },

  // Cabeçalho do cartão do desafio.
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Área que contém nome e duração.
  challengeHeading: {
    flex: 1,
    marginRight: 10,
  },

  // Nome do desafio.
  challengeName: {
    color: "#E8F5EC",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  // Duração do desafio.
  challengeDuration: {
    color: "#9CB4A5",
    fontSize: 13,
  },

  // Botão pequeno de exclusão.
  deleteButton: {
    borderWidth: 1,
    borderColor: "#784343",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  // Texto do botão pequeno de exclusão.
  deleteButtonText: {
    color: "#F0A0A0",
    fontSize: 12,
    fontWeight: "600",
  },

  // Caixa que contém o resumo financeiro.
  moneyBox: {
    backgroundColor: "#10241B",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },

  // Rótulos das informações financeiras.
  moneyLabel: {
    color: "#9CB4A5",
    fontSize: 13,
  },

  // Valor total já guardado.
  savedAmount: {
    color: "#72E6A0",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 14,
  },

  // Linha que organiza uma informação financeira.
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  // Valor de cada informação financeira.
  moneyValue: {
    color: "#E8F5EC",
    fontSize: 13,
    fontWeight: "600",
  },

  // Fundo da barra de progresso.
  progressBackground: {
    height: 8,
    backgroundColor: "#20382B",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 5,
  },

  // Parte preenchida da barra de progresso.
  progressFill: {
    height: "100%",
    backgroundColor: "#42D780",
    borderRadius: 10,
  },

  // Texto que mostra a porcentagem concluída.
  progressText: {
    color: "#72E6A0",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 8,
  },

  // Botão para abrir um desafio.
  openButton: {
    backgroundColor: "#42D780",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
  },

  // Texto do botão de acesso.
  openButtonText: {
    color: "#07130F",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Botão para voltar à lista.
  backButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#315B43",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 22,
  },

  // Texto do botão de voltar.
  backButtonText: {
    color: "#72E6A0",
    fontSize: 14,
    fontWeight: "600",
  },

  // Cartão com a explicação da regra.
  infoCard: {
    backgroundColor: "#0C1D15",
    borderWidth: 1,
    borderColor: "#244635",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },

  // Título da explicação.
  infoTitle: {
    color: "#72E6A0",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  // Texto explicativo.
  infoText: {
    color: "#B3C8BA",
    fontSize: 14,
    lineHeight: 21,
  },

  // Título da grade de dias.
  daysTitle: {
    color: "#E8F5EC",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },

  // Organiza os cartões dos dias em linhas.
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  // Cartão individual de cada dia.
  dayCard: {
    width: "31.5%",
    backgroundColor: "#10241B",
    borderWidth: 1,
    borderColor: "#244635",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 3,
    alignItems: "center",
    marginBottom: 9,
  },

  // Estilo aplicado aos dias concluídos.
  dayCardCompleted: {
    backgroundColor: "#16452C",
    borderColor: "#42D780",
  },

  // Número do dia.
  dayNumber: {
    color: "#D6E7DB",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  // Valor monetário do dia.
  dayAmount: {
    color: "#72E6A0",
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 7,
  },

  // Estado de conclusão do dia.
  dayStatus: {
    color: "#8FA99A",
    fontSize: 10,
    fontWeight: "600",
  },

  // Cor do texto dos dias concluídos.
  completedText: {
    color: "#FFFFFF",
  },

  // Cartão que aparece quando o desafio é concluído.
  successCard: {
    backgroundColor: "#16452C",
    borderWidth: 1,
    borderColor: "#42D780",
    borderRadius: 14,
    padding: 15,
    marginTop: 14,
  },

  // Título da mensagem de conclusão.
  successTitle: {
    color: "#72E6A0",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 7,
  },

  // Texto da mensagem de conclusão.
  successText: {
    color: "#E8F5EC",
    fontSize: 13,
    lineHeight: 20,
  },

  // Botão de exclusão na tela individual.
  deleteFullButton: {
    borderWidth: 1,
    borderColor: "#784343",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 24,
  },

  // Texto do botão de exclusão individual.
  deleteFullButtonText: {
    color: "#F0A0A0",
    fontSize: 14,
    fontWeight: "600",
  },

  // Aviso exibido no final da tela.
  footer: {
    color: "#71877A",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 24,
  },

  // Fundo escuro que cobre a tela atrás do modal.
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Cartão principal da janela personalizada.
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#10241B",
    borderColor: "#315B43",
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
  },

  // Título do modal.
  modalTitle: {
    color: "#E8F5EC",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 12,
  },

  // Mensagem explicativa do modal.
  modalMessage: {
    color: "#B8CCBE",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },

  // Organiza os botões do modal.
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 10,
  },

  // Aparência padrão dos botões do modal.
  modalButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#315B43",
    backgroundColor: "#07130F",
    justifyContent: "center",
    alignItems: "center",
  },

  // Cor do botão principal do modal.
  modalButtonPrimary: {
    backgroundColor: "#42D780",
    borderColor: "#42D780",
  },

  // Cor do botão que representa uma ação destrutiva.
  modalButtonDestructive: {
    backgroundColor: "#7F2929",
    borderColor: "#B84444",
  },

  // Texto padrão dos botões do modal.
  modalButtonText: {
    color: "#E8F5EC",
    fontSize: 14,
    fontWeight: "600",
  },

  // Texto dos botões destacados.
  modalButtonTextEmphasis: {
    color: "#07130F",
  },
});
