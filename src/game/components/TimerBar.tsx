import { StyleSheet, Text, View } from "react-native";

type TimerBarProps = {
  remainingSeconds: number;
  totalSeconds: number;
};

export function TimerBar({ remainingSeconds, totalSeconds }: TimerBarProps) {
  const percent = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const urgent = remainingSeconds <= 15;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>Mom ETA</Text>
        <Text style={[styles.time, urgent && styles.urgent]}>{Math.ceil(remainingSeconds)}s</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, urgent && styles.fillUrgent, { width: `${percent * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 2,
    borderColor: "#28231f"
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7
  },
  label: {
    color: "#28231f",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  time: {
    color: "#24645d",
    fontSize: 20,
    fontWeight: "900"
  },
  urgent: {
    color: "#d12b3f"
  },
  track: {
    height: 12,
    overflow: "hidden",
    borderRadius: 6,
    backgroundColor: "#ded7cf"
  },
  fill: {
    height: "100%",
    backgroundColor: "#2bb3a3"
  },
  fillUrgent: {
    backgroundColor: "#ff4159"
  }
});
