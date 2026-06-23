import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type TimerBarProps = {
  remainingSeconds: number;
  totalSeconds: number;
};

export function TimerBar({ remainingSeconds, totalSeconds }: TimerBarProps) {
  const percent = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const urgent = remainingSeconds <= 15;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (urgent) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true })
        ])
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.setValue(1);
    }

    return () => {
      pulseLoopRef.current?.stop();
    };
  }, [urgent, pulseAnim]);

  return (
    <Animated.View style={[styles.wrap, urgent && styles.wrapUrgent, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.header}>
        <Text style={[styles.label, urgent && styles.labelUrgent]}>Mom ETA</Text>
        <Text style={[styles.time, urgent && styles.urgent]}>{Math.ceil(remainingSeconds)}s</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, urgent && styles.fillUrgent, { width: `${percent * 100}%` }]} />
      </View>
    </Animated.View>
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
  wrapUrgent: {
    backgroundColor: "rgba(255,220,220,0.95)",
    borderColor: "#ff1744"
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
  labelUrgent: {
    color: "#b91c1c"
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
