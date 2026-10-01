// Importa o componente que cria a navegação por abas.
import { Tabs } from "expo-router";

// Importa a função que identifica o tema do aparelho.
import { useColorScheme } from "react-native";

// Importa as cores definidas no tema do LoneVault.
import { Colors } from "@/constants/theme";

// Define as abas de navegação do aplicativo.
export default function AppTabs() {
  // Descobre se o aparelho está usando o tema claro ou escuro.
  const scheme = useColorScheme();

  // Seleciona as cores correspondentes ao tema atual.
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    // Configura a barra de navegação inferior.
    <Tabs
      screenOptions={{
        // Esconde o cabeçalho padrão de cada tela.
        headerShown: false,

        // Define a cor do texto da aba selecionada.
        tabBarActiveTintColor: colors.text,

        // Define a aparência da barra inferior.
        tabBarStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {/* Tela inicial do aplicativo. */}
      <Tabs.Screen name="index" options={{ title: "Início" }} />

      {/* Tela dos desafios. */}
      <Tabs.Screen name="challenges" options={{ title: "Desafios" }} />

      {/* Tela do histórico. */}
      <Tabs.Screen name="history" options={{ title: "Histórico" }} />

      {/* Nova tela para configurar os lembretes. */}
      <Tabs.Screen name="reminders" options={{ title: "Lembretes" }} />

      {/* Tela do perfil. */}
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
