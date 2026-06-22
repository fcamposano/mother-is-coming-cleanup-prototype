import { StyleSheet, Text, View } from "react-native";

import { Camera, ToolType } from "../types/gameTypes";

type DebugOverlayProps = {
  camera: Camera;
  remainingMessCount: number;
  selectedTool: ToolType;
};

export function DebugOverlay({ camera, remainingMessCount, selectedTool }: DebugOverlayProps) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Text style={styles.text}>camera: {Math.round(camera.x)}, {Math.round(camera.y)}</Text>
      <Text style={styles.text}>remaining: {remainingMessCount}</Text>
      <Text style={styles.text}>tool: {selectedTool}</Text>
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
  }
});
