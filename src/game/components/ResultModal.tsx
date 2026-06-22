import { Pressable, StyleSheet, Text, View } from "react-native";

type ResultModalProps = {
  visible: boolean;
  won: boolean;
  cleanedCount: number;
  missedCount: number;
  missedLabels: string[];
  score: number;
  onRetry: () => void;
};

export function ResultModal({ visible, won, cleanedCount, missedCount, missedLabels, score, onRetry }: ResultModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <Text style={styles.kicker}>{won ? "Room survived inspection" : "Inspection complete"}</Text>
        <Text style={styles.title}>{won ? "Spotless enough!" : "Mom found evidence"}</Text>
        <Text style={styles.joke}>
          {won
            ? "The room is clean, the alibi is strong, and nobody asks about the closet."
            : "The red flags are not decorations. Apparently that matters."}
        </Text>
        <View style={styles.stats}>
          <Stat label="Cleaned" value={cleanedCount} />
          <Stat label="Missed" value={missedCount} />
          <Stat label="Score" value={score} />
        </View>
        {!won && missedLabels.length > 0 ? (
          <View style={styles.missedWrap}>
            <Text style={styles.missedTitle}>Missed messes</Text>
            <Text style={styles.missedText}>{missedLabels.join(", ")}</Text>
          </View>
        ) : null}
        <Pressable onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}>Retry panic clean</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(34, 29, 24, 0.64)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    padding: 20,
    position: "absolute",
    right: 0,
    top: 0
  },
  panel: {
    backgroundColor: "#fffaf3",
    borderColor: "#28231f",
    borderRadius: 8,
    borderWidth: 3,
    padding: 20,
    width: "100%"
  },
  kicker: {
    color: "#d87932",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: "#28231f",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 6
  },
  joke: {
    color: "#5a5149",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 10
  },
  stats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18
  },
  stat: {
    alignItems: "center",
    backgroundColor: "#f0e2cf",
    borderRadius: 8,
    flex: 1,
    padding: 10
  },
  statValue: {
    color: "#28231f",
    fontSize: 22,
    fontWeight: "900"
  },
  statLabel: {
    color: "#6d6258",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  missedWrap: {
    backgroundColor: "#ffe0e5",
    borderColor: "#ff4159",
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 14,
    padding: 10
  },
  missedTitle: {
    color: "#9d1829",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  missedText: {
    color: "#5a252b",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 19,
    marginTop: 4
  },
  retry: {
    alignItems: "center",
    backgroundColor: "#28231f",
    borderRadius: 8,
    marginTop: 18,
    padding: 15
  },
  retryText: {
    color: "#fffaf3",
    fontSize: 16,
    fontWeight: "900"
  }
});
