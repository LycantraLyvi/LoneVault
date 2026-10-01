/*
 * TELA DE HISTÓRICO DO LONEVAULT
 * Mostra uma lista de movimentações financeiras demonstrativas.
 */
// Importa os componentes visuais e de rolagem do React Native.
import { ScrollView, StyleSheet, Text, View } from "react-native";

// Importa o SafeAreaView da biblioteca que respeita as áreas seguras do celular.
import { SafeAreaView } from "react-native-safe-area-context";

// Cores que mantêm a identidade visual do aplicativo.
const COLORS = {
  background: "#0B0F0D",
  card: "#151C18",
  green: "#35D07F",
  red: "#FF7777",
  text: "#F4F7F5",
  muted: "#8C9A91",
  border: "#26332B",
};

// Dados fictícios para visualizar como será o histórico.
const TRANSACTIONS = [
  {
    id: "1",
    title: "Depósito na meta",
    date: "Hoje, 09:30",
    amount: "+ R$ 50,00",
    type: "income",
    icon: "↓",
  },
  {
    id: "2",
    title: "Depósito na meta",
    date: "Ontem, 18:15",
    amount: "+ R$ 25,00",
    type: "income",
    icon: "↓",
  },
  {
    id: "3",
    title: "Retirada",
    date: "22 set. 2026, 14:20",
    amount: "- R$ 30,00",
    type: "expense",
    icon: "↑",
  },
  {
    id: "4",
    title: "Depósito na meta",
    date: "20 set. 2026, 10:05",
    amount: "+ R$ 100,00",
    type: "income",
    icon: "↓",
  },
];

// Componente principal da tela de histórico.
export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Permite rolar a lista de movimentações. */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho da tela. */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ACOMPANHAMENTO</Text>
          <Text style={styles.title}>Histórico</Text>
          <Text style={styles.subtitle}>
            Veja as movimentações da sua jornada.
          </Text>
        </View>

        {/* Resumo demonstrativo das movimentações. */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Movimentações registradas</Text>
          <Text style={styles.summaryValue}>{TRANSACTIONS.length}</Text>
          <Text style={styles.summaryDescription}>
            Este é um histórico de exemplo.
          </Text>
        </View>

        {/* Título da lista de movimentações. */}
        <Text style={styles.sectionTitle}>Movimentações recentes</Text>

        {/* Percorremos a lista e criamos um cartão por movimentação. */}
        {TRANSACTIONS.map((transaction) => {
          // Identificamos se a movimentação é entrada ou saída.
          const isIncome = transaction.type === "income";

          return (
            <View key={transaction.id} style={styles.transactionCard}>
              {/* Ícone que diferencia entradas e saídas. */}
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor: isIncome ? "#20352A" : "#382323",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.iconText,
                    {
                      color: isIncome ? COLORS.green : COLORS.red,
                    },
                  ]}
                >
                  {transaction.icon}
                </Text>
              </View>

              {/* Nome e data da movimentação. */}
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>

              {/* O valor muda de cor conforme o tipo de movimentação. */}
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: isIncome ? COLORS.green : COLORS.red,
                  },
                ]}
              >
                {transaction.amount}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos da tela de histórico.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 22,
    paddingBottom: 36,
  },
  header: {
    marginTop: 12,
    marginBottom: 26,
  },
  eyebrow: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    marginBottom: 30,
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 13,
  },
  summaryValue: {
    color: COLORS.green,
    fontSize: 36,
    fontWeight: "800",
    marginTop: 8,
  },
  summaryDescription: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 14,
  },
  transactionCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 23,
    fontWeight: "700",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  transactionDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },
  transactionAmount: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
  },
});
