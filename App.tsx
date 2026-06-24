import "react-native-gesture-handler";

import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { TitanOne_400Regular } from "@expo-google-fonts/titan-one";

import { HomeScreen } from "./src/screens/HomeScreen";
import { GameScreen } from "./src/screens/GameScreen";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ TitanOne_400Regular });
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      {activeRoom
        ? <GameScreen onExit={() => setActiveRoom(null)} />
        : <HomeScreen onStartRoom={(id) => setActiveRoom(id)} />
      }
    </>
  );
}
