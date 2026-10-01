// Importa os componentes usados para montar a tela inicial e seus estilos.
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Respeita as áreas seguras do celular, como a região da barra de status.
import { SafeAreaView } from "react-native-safe-area-context";

// Define a paleta visual do LoneVault: fundo escuro, cartões e destaque verde.
const COLORS = {
  background: "#0B0F0E",
  surface: "#151B18",
  surfaceLight: "#202923",
  primary: "#B7F397",
  text: "#F4F7F2",
  muted: "#929D95",
  border: "#29332C",
};

// Renderiza o painel inicial com o saldo, a meta e uma mensagem de incentivo.
export default function HomeScreen() {
  // Valores de demonstração; futuramente poderão vir dos dados do usuário.
  const savedAmount = 750;
  const goalAmount = 1500;
  const progress = savedAmount / goalAmount;
  const progressPercent = Math.round(progress * 100);

  // Formata os valores numéricos como moeda brasileira (Real).
  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  return (
    // Aplica o fundo principal da tela.
    <View style={styles.container}>
      {/* Mantém o conteúdo dentro das áreas seguras do dispositivo. */}
      <SafeAreaView style={styles.safeArea}>
        {/* Permite rolar o conteúdo em telas menores. */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cabeçalho com o nome da marca e um avatar provisório. */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>LONEVAULT</Text>
              <Text style={styles.greeting}>Sua jornada começa aqui.</Text>
            </View>

            {/* Avatar provisório identificado pela inicial da marca. */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>L</Text>
            </View>
          </View>

          {/* Cartão principal que destaca o total guardado. */}
          <View style={styles.balanceCard}>
            <Text style={styles.cardLabel}>TOTAL GUARDADO</Text>
            <Text style={styles.balance}>{formatCurrency(savedAmount)}</Text>

            {/* Mostra uma indicação visual de status do saldo. */}
            <View style={styles.balanceFooter}>
              <View style={styles.statusDot} />
              <Text style={styles.balanceCaption}>
                Continue avançando no seu ritmo
              </Text>
            </View>

            {/* Decoração circular no canto do cartão de saldo. */}
            <View style={styles.cardDecoration} />
          </View>

          {/* Cabeçalho da seção de acompanhamento do desafio. */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Seu desafio</Text>
              <Text style={styles.sectionSubtitle}>Um passo de cada vez.</Text>
            </View>
            <Text style={styles.challengeIcon}>↗</Text>
          </View>

          {/* Cartão com a meta, o progresso e o valor que falta guardar. */}
          <View style={styles.challengeCard}>
            <View style={styles.challengeTop}>
              <View>
                <Text style={styles.cardLabel}>META DE ECONOMIA</Text>
                <Text style={styles.goalAmount}>
                  {formatCurrency(goalAmount)}
                </Text>
              </View>

              {/* Selo com a porcentagem da meta já alcançada. */}
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{progressPercent}%</Text>
              </View>
            </View>

            {/* Barra visual preenchida conforme o progresso da meta. */}
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>

            {/* Exibe os valores guardado e restante abaixo da barra. */}
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                {formatCurrency(savedAmount)} guardados
              </Text>
              <Text style={styles.progressLabel}>
                {formatCurrency(goalAmount - savedAmount)} restantes
              </Text>
            </View>
          </View>

          {/* Cartão de incentivo para manter o usuário focado na meta. */}
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Text style={styles.tipIconText}>✦</Text>
            </View>

            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Mantenha o foco</Text>
              <Text style={styles.tipDescription}>
                Cada valor guardado aproxima você da sua meta.
              </Text>
            </View>
          </View>

          {/* A navegação foi removida daqui: as abas reais são criadas pelo Expo Router. */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Define o layout visual dos elementos da tela inicial.
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

  // Define o espaçamento interno do conteúdo rolável.
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // Organiza o nome da marca e o avatar lado a lado.
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  // Destaca o nome da marca com letras espaçadas.
  brand: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 3,
  },

  // Estiliza o texto auxiliar abaixo do nome da marca.
  greeting: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
  },

  // Cria o círculo de fundo do avatar provisório.
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

  // Estiliza a letra exibida no avatar.
  avatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  // Define o visual do cartão de saldo total.
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  // Estiliza os rótulos pequenos dos cartões.
  cardLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // Dá destaque ao valor total guardado.
  balance: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 20,
  },

  // Alinha o ponto de status com o texto do saldo.
  balanceFooter: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Desenha o pequeno ponto verde de status.
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },

  // Estiliza a frase auxiliar do cartão de saldo.
  balanceCaption: {
    color: COLORS.muted,
    fontSize: 12,
  },

  // Posiciona a decoração circular no canto do cartão.
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

  // Organiza o título e o símbolo da seção de desafio.
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Estiliza o título da seção.
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
  },

  // Estiliza o subtítulo da seção.
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },

  // Destaca o símbolo decorativo do desafio.
  challengeIcon: {
    color: COLORS.primary,
    fontSize: 26,
  },

  // Define o cartão que contém os dados da meta.
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },

  // Alinha a meta e o selo de porcentagem na mesma linha.
  challengeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Estiliza o valor total da meta.
  goalAmount: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 9,
  },

  // Cria o fundo do selo de progresso percentual.
  percentBadge: {
    backgroundColor: "#293A2B",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // Estiliza o número percentual dentro do selo.
  percentText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  // Desenha o trilho escuro da barra de progresso.
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
    overflow: "hidden",
    marginTop: 24,
  },

  // Desenha a parte verde preenchida da barra de progresso.
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // Distribui os rótulos de valores abaixo da barra.
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 6,
  },

  // Estiliza os textos de valores guardados e restantes.
  progressLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },

  // Define o cartão de incentivo com ícone e texto.
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#172019",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#293A2B",
    marginBottom: 28,
  },

  // Cria o quadrado arredondado atrás do símbolo de incentivo.
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#293A2B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  // Estiliza o símbolo decorativo do cartão de incentivo.
  tipIconText: {
    color: COLORS.primary,
    fontSize: 22,
  },

  // Permite que a área de texto do incentivo ocupe o espaço disponível.
  tipContent: {
    flex: 1,
  },

  // Estiliza o título do incentivo.
  tipTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  // Estiliza a descrição do incentivo.
  tipDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});
