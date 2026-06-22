import { StyleSheet, Text, View } from "react-native";

import { Camera, GamePhase, MessRuntimeState, ToolType } from "../types/gameTypes";

type DebugOverlayProps = {
  camera: Camera;
  phase: GamePhase;
  remainingMessCount: number;
  remainingSeconds: number;
  selectedTool: ToolType;
  viewport: { width: number; height: number };
  world: { width: number; height: number };
  messes: MessRuntimeState[];
};

export function DebugOverlay({
  camera,
  phase,
  remainingMessCount,
  remainingSeconds,
  selectedTool,
  viewport,
  world,
  messes
}: DebugOverlayProps) {
  const missedIds = messes
    .filter((mess) => !mess.cleaned)
    .map((mess) => mess.id)
    .join(", ");

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.text}>phase: {phase}</Text>
      <Text style={styles.text}>camera: {Math.round(camera.x)}, {Math.round(camera.y)}</Text>
      <Text style={styles.text}>viewport: {Math.round(viewport.width)}x{Math.round(viewport.height)}</Text>
      <Text style={styles.text}>world: {world.width}x{world.height}</Text>
      <Text style={styles.text}>remaining: {remainingMessCount}</Text>
      <Text style={styles.text}>timer: {Math.ceil(remainingSeconds)}s</Text>
      <Text style={styles.text}>tool: {selectedTool}</Text>
      <Text style={styles.ids} numberOfLines={3}>ids: {missedIds || "none"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 8,
    left: 12,
    padding: 8,
    position: "absolute",
    top: 132
  },
  text: {
    color: "#b9ff8a",
    fontFamily: "Courier",
    fontSize: 12,
    fontWeight: "700"
  },
  ids: {
    color: "#b9ff8a",
    fontFamily: "Courier",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    maxWidth: 310
  }
});
