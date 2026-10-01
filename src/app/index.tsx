// Importa os hooks que permitem carregar dados e controlar atualizações da tela.
import { useCallback, useState } from "react";

// Permite ler os desafios que já estão salvos no aparelho.
import AsyncStorage from "@react-native-async-storage/async-storage";

// Permite navegar da tela inicial para a tela de desafios.
import { useFocusEffect, useRouter } from "expo-router";

// Importa os componentes visuais usados nesta tela.
import {
  Pressable, // Cria botões clicáveis.
  ScrollView, // Permite rolar a tela quando o conteúdo não cabe.
  StyleSheet, // Organiza os estilos visuais.
  Text, // Exibe textos.
  View, // Agrupa componentes.
} from "react-native";

// Mantém a tela dentro das áreas seguras do celular.
import { SafeAreaView } from "react-native-safe-area-context";

// Define o formato dos desafios salvos pela tela de desafios.
type Challenge = {
  id: string; // Identificador único do desafio.
  name: string; // Nome escolhido pelo usuário.
  totalDays: number; // Quantidade total de dias do desafio.
  completedDays: number[]; // Dias que o usuário marcou como concluídos.
};

// Usa a mesma chave da tela challenges.tsx para ler os mesmos dados.
const STORAGE_KEY = "@lonevault:challenges";

// Define as cores usadas no painel financeiro.
const COLORS = {
  background: "#0B0F0E",
  surface: "#151B18",
  surfaceLight: "#202923",
  primary: "#B7F397",
  text: "#F4F7F2",
  muted: "#929D95",
  border: "#29332C",
};

// Mostra o resumo financeiro calculado a partir dos desafios salvos.
export default function HomeScreen() {
  // Permite abrir a tela de desafios ao tocar no botão.
  const router = useRouter();

  // Guarda os desafios lidos do armazenamento local.
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Indica se a leitura inicial terminou.
  const [loading, setLoading] = useState(true);

  // Formata valores como dinheiro brasileiro.
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Calcula a soma de 1 até o número total de dias.
  // Exemplo: 30 dias resultam em 1 + 2 + ... + 30.
  const calculateGoal = (totalDays: number) =>
    (totalDays * (totalDays + 1)) / 2;

  // Soma os valores dos dias concluídos em um desafio.
  const calculateSaved = (completedDays: number[]) =>
    completedDays.reduce((sum, day) => sum + day, 0);

  // Lê novamente os dados salvos no aparelho.
  // useCallback permite reutilizar esta função sem recriá-la a cada renderização.
  const loadChallenges = useCallback(async () => {
    try {
      // Busca a lista salva usando a mesma chave da tela de desafios.
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);

      // Se não houver dados, mostra uma lista vazia.
      if (!savedData) {
        setChallenges([]);
        return;
      }

      // Converte o texto JSON salvo em uma lista.
      const parsedData: unknown = JSON.parse(savedData);

      // Só utiliza o conteúdo se ele for uma lista.
      if (Array.isArray(parsedData)) {
        setChallenges(parsedData as Challenge[]);
      } else {
        setChallenges([]);
      }
    } catch (error) {
      // Registra problemas de leitura para facilitar a identificação.
      console.error("Não foi possível carregar os desafios:", error);
      setChallenges([]);
    } finally {
      // Esconde o estado de carregamento mesmo se ocorrer um erro.
      setLoading(false);
    }
  }, []);

  // Carrega os dados sempre que a tela inicial recebe foco.
  // Assim, o resumo é atualizado quando o usuário volta dos desafios.
  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [loadChallenges]),
  );

  // Soma o dinheiro acumulado em todos os desafios.
  const savedAmount = challenges.reduce(
    (total, challenge) => total + calculateSaved(challenge.completedDays),
    0,
  );

  // Soma as metas de todos os desafios.
  const goalAmount = challenges.reduce(
    (total, challenge) => total + calculateGoal(challenge.totalDays),
    0,
  );

  // Conta os desafios que ainda não foram concluídos.
  const activeChallenges = challenges.filter(
    (challenge) => challenge.completedDays.length < challenge.totalDays,
  ).length;

  // Evita divisão por zero quando ainda não há metas.
  const progress = goalAmount > 0 ? Math.min(savedAmount / goalAmount, 1) : 0;

  // Converte o progresso em uma porcentagem inteira.
  const progressPercent = Math.round(progress * 100);

  // Calcula quanto ainda falta para atingir as metas somadas.
  const remainingAmount = Math.max(goalAmount - savedAmount, 0);

  return (
    // Fundo principal da tela inicial.
    <View style={styles.container}>
      {/* Respeita as áreas seguras do celular. */}
      <SafeAreaView style={styles.safeArea}>
        {/* Permite rolar o conteúdo em telas menores. */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cabeçalho com a marca e um avatar provisório. */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>LONEVAULT</Text>
              <Text style={styles.greeting}>Seu resumo financeiro.</Text>
            </View>

            {/* Avatar provisório com a inicial da marca. */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>L</Text>
            </View>
          </View>

          {/* Cartão principal com a soma guardada em todos os desafios. */}
          <View style={styles.balanceCard}>
            <Text style={styles.cardLabel}>TOTAL ACUMULADO</Text>

            <Text style={styles.balance}>
              {loading ? "Carregando..." : formatCurrency(savedAmount)}
            </Text>

            {/* Mensagem de apoio abaixo do saldo. */}
            <View style={styles.balanceFooter}>
              <View style={styles.statusDot} />
              <Text style={styles.balanceCaption}>
                {challenges.length === 0
                  ? "Crie seu primeiro desafio para começar"
                  : "Cada dia concluído aproxima você da meta"}
              </Text>
            </View>

            {/* Círculo decorativo no canto do cartão. */}
            <View style={styles.cardDecoration} />
          </View>

          {/* Dois cartões com a meta total e a quantidade de desafios ativos. */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardLeft]}>
              <Text style={styles.cardLabel}>META TOTAL</Text>
              <Text style={styles.statValue}>
                {loading ? "..." : formatCurrency(goalAmount)}
              </Text>
              <Text style={styles.statCaption}>Soma das metas</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.cardLabel}>DESAFIOS ATIVOS</Text>
              <Text style={styles.statValue}>
                {loading ? "..." : activeChallenges}
              </Text>
              <Text style={styles.statCaption}>Em andamento</Text>
            </View>
          </View>

          {/* Mostra o progresso combinado de todos os desafios. */}
          <View style={styles.challengeCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Progresso geral</Text>
                <Text style={styles.sectionSubtitle}>
                  Sua evolução em todas as metas.
                </Text>
              </View>

              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{progressPercent}%</Text>
              </View>
            </View>

            {/* Barra preenchida de acordo com a porcentagem acumulada. */}
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>

            {/* Exibe os valores guardado e restante. */}
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                {formatCurrency(savedAmount)} guardados
              </Text>
              <Text style={styles.progressLabel}>
                {formatCurrency(remainingAmount)} restantes
              </Text>
            </View>
          </View>

          {/* Mensagem de incentivo. */}
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Text style={styles.tipIconText}>✦</Text>
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Mantenha o foco</Text>
              <Text style={styles.tipDescription}>
                Cada valor guardado aproxima você das suas metas.
              </Text>
            </View>
          </View>

          {/* Mostra uma mensagem diferente quando ainda não existem desafios. */}
          {challenges.length === 0 && !loading && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhum desafio criado</Text>
              <Text style={styles.emptyText}>
                Acesse seus desafios e crie o primeiro para ver seu resumo
                financeiro aqui.
              </Text>
            </View>
          )}

          {/* Leva o usuário à tela onde os desafios são criados e acompanhados. */}
          <Pressable
            style={styles.openButton}
            onPress={() => router.push("/challenges")}
            accessibilityRole="button"
          >
            <Text style={styles.openButtonText}>Acessar meus desafios →</Text>
          </Pressable>

          {/* Explica que os valores são registros do aplicativo, não dinheiro real. */}
          <Text style={styles.footer}>
            Valores calculados com base nos dias concluídos. O LoneVault não
            movimenta dinheiro real.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Define o visual dos cartões, textos e elementos da tela.
const styles = StyleSheet.create({
  // Fundo principal que ocupa toda a tela.
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Faz o conteúdo respeitar as áreas seguras do dispositivo.
  safeArea: {
    flex: 1,
  },

  // Espaçamento interno do conteúdo rolável.
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // Organiza a marca e o avatar lado a lado.
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  // Nome da marca.
  brand: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 3,
  },

  // Texto auxiliar abaixo da marca.
  greeting: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
  },

  // Círculo do avatar provisório.
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  // Inicial dentro do avatar.
  avatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  // Cartão principal do total acumulado.
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  // Rótulos pequenos dos cartões.
  cardLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  // Valor total acumulado em destaque.
  balance: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 20,
  },

  // Alinha o ponto de status com a mensagem.
  balanceFooter: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Pequeno ponto verde de status.
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },

  // Mensagem auxiliar do saldo.
  balanceCaption: {
    color: COLORS.muted,
    fontSize: 12,
    flexShrink: 1,
  },

  // Círculo decorativo no canto do cartão.
  cardDecoration: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#29372C",
    right: -45,
    top: -45,
  },

  // Organiza os cartões de estatísticas lado a lado.
  statsRow: {
    flexDirection: "row",
    marginBottom: 26,
  },

  // Cartão individual de estatística.
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Espaço entre os dois cartões.
  statCardLeft: {
    marginRight: 12,
  },

  // Número ou valor exibido no cartão de estatística.
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },

  // Texto auxiliar do cartão de estatística.
  statCaption: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6,
  },

  // Cartão de progresso geral.
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },

  // Organiza título e porcentagem do progresso.
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Título da seção.
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "700",
  },

  // Subtítulo da seção.
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  // Selo com a porcentagem geral.
  percentBadge: {
    backgroundColor: "#293A2B",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
  },

  // Texto percentual.
  percentText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  // Fundo da barra de progresso.
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    overflow: "hidden",
    marginTop: 24,
  },

  // Parte preenchida da barra de progresso.
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Organiza os valores abaixo da barra.
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 6,
  },

  // Texto dos valores guardado e restante.
  progressLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },

  // Cartão de incentivo.
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#172019",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#293A2B",
    marginBottom: 18,
  },

  // Fundo do símbolo de incentivo.
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#293A2B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  // Símbolo de incentivo.
  tipIconText: {
    color: COLORS.primary,
    fontSize: 22,
  },

  // Área de texto do incentivo.
  tipContent: {
    flex: 1,
  },

  // Título do incentivo.
  tipTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  // Descrição do incentivo.
  tipDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  // Cartão exibido quando não há desafios.
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    alignItems: "center",
  },

  // Título do estado vazio.
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  // Descrição do estado vazio.
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  // Botão para acessar a tela de desafios.
  openButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 18,
  },

  // Texto do botão de acesso.
  openButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "800",
  },

  // Aviso sobre os valores exibidos.
  footer: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
});
