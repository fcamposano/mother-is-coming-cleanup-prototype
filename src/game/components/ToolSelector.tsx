import { Pressable, StyleSheet, Text, View } from "react-native";

import { getAsset } from "../assets/AssetRegistry";
import { ToolType } from "../types/gameTypes";

const TOOLS: { tool: ToolType; assetKey: string; label: string }[] = [
  { tool: "vacuum", assetKey: "tool_vacuum", label: "Vacuum" },
  { tool: "mop", assetKey: "tool_mop", label: "Mop" },
  { tool: "hand", assetKey: "tool_hand", label: "Hand" }
];

type ToolSelectorProps = {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
};

export function ToolSelector({ selectedTool, onSelectTool }: ToolSelectorProps) {
  return (
    <View style={styles.wrap}>
      {TOOLS.map(({ tool, assetKey, label }) => {
        const asset = getAsset(assetKey);
        const selected = selectedTool === tool;

        return (
          <Pressable
            key={tool}
            onPress={() => onSelectTool(tool)}
            style={[
              styles.button,
              { borderColor: asset.color, backgroundColor: selected ? asset.accentColor : "#fffaf3" },
              selected && styles.selected
            ]}
          >
            <Text style={[styles.icon, { color: asset.color }]}>{asset.placeholderText}</Text>
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between"
  },
  button: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 3,
    flex: 1,
    height: 72,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5
  },
  selected: {
    transform: [{ translateY: -4 }]
  },
  icon: {
    fontSize: 16,
    fontWeight: "900"
  },
  label: {
    color: "#28231f",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4
  }
});
