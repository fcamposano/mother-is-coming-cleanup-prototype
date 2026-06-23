import "react-native-gesture-handler";

import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { TitanOne_400Regular } from "@expo-google-fonts/titan-one";

import { GameScreen } from "./src/screens/GameScreen";

export default function App() {
  const [fontsLoaded] = useFonts({ TitanOne_400Regular });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <GameScreen />
    </>
  );
}
