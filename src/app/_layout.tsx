// Importa os temas prontos do React Navigation usados pelo Expo Router.
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";

// Importa o hook que identifica se o aparelho está no modo claro ou escuro.
import { useColorScheme } from "react-native";

// Importa as ferramentas de notificação do Expo.
import * as Notifications from "expo-notifications";

// Importa as abas principais do LoneVault.
import AppTabs from "@/components/app-tabs";

// Define como uma notificação deve aparecer enquanto o app está aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Permite mostrar a notificação como uma faixa na tela.
    shouldShowBanner: true,

    // Permite que ela também apareça na central de notificações.
    shouldShowList: true,

    // Não altera o contador de notificações do ícone do app.
    shouldSetBadge: false,

    // Não força um som próprio do aplicativo.
    shouldPlaySound: true,
  }),
});

// Define o layout principal do aplicativo.
export default function RootLayout() {
  // Descobre o tema atual do aparelho.
  const colorScheme = useColorScheme();

  return (
    // Aplica o tema claro ou escuro conforme o aparelho.
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Exibe as abas e as telas do LoneVault. */}
      <AppTabs />
    </ThemeProvider>
  );
}
