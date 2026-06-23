import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DebugOverlay } from "../game/components/DebugOverlay";
import { GameCanvas } from "../game/components/GameCanvas";
import { ResultModal } from "../game/components/ResultModal";
import { TimerBar } from "../game/components/TimerBar";
import { ToolSelector } from "../game/components/ToolSelector";
import { playSound, startMusic, stopMusic } from "../game/systems/AudioSystem";
import { triggerHaptic } from "../game/systems/HapticsSystem";
import { selectCleanedCount, selectMissedCount, useGameStore } from "../game/state/gameStore";

export function GameScreen() {
  const level = useGameStore((state) => state.level);
  const messes = useGameStore((state) => state.messes);
  const selectedTool = useGameStore((state) => state.selectedTool);
  const camera = useGameStore((state) => state.camera);
  const viewport = useGameStore((state) => state.viewport);
  const remainingSeconds = useGameStore((state) => state.remainingSeconds);
  const phase = useGameStore((state) => state.phase);
  const score = useGameStore((state) => state.score);
  const debugMode = useGameStore((state) => state.debugMode);
  const setViewport = useGameStore((state) => state.setViewport);
  const setSelectedTool = useGameStore((state) => state.setSelectedTool);
  const setCamera = useGameStore((state) => state.setCamera);
  const cleanMess = useGameStore((state) => state.cleanMess);
  const tick = useGameStore((state) => state.tick);
  const toggleDebugMode = useGameStore((state) => state.toggleDebugMode);
  const finishInspection = useGameStore((state) => state.finishInspection);
  const retry = useGameStore((state) => state.retry);
  const cleanedCount = useGameStore(selectCleanedCount);
  const missedCount = useGameStore(selectMissedCount);
  const missedLabels = useMemo(() => messes.filter((mess) => !mess.cleaned).map((mess) => mess.label), [messes]);
  const inspectionPlayedRef = useRef(false);
  const victoryPlayedRef = useRef(false);
  const vignetteAnim = useRef(new Animated.Value(0)).current;
  const vignetteLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shakeTriggeredRef = useRef(false);

  useEffect(() => {
    let last = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      tick((now - last) / 1000);
      last = now;
    }, 100);

    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    if (phase === "playing") {
      void startMusic();
      return;
    }

    void stopMusic();
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") {
      vignetteLoopRef.current?.stop();
      vignetteAnim.setValue(0);
      shakeTriggeredRef.current = false;
      return;
    }

    if (remainingSeconds <= 5 && remainingSeconds > 0) {
      if (!vignetteLoopRef.current) {
        vignetteLoopRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(vignetteAnim, { toValue: 0.55, duration: 250, useNativeDriver: true }),
            Animated.timing(vignetteAnim, { toValue: 0.1, duration: 350, useNativeDriver: true })
          ])
        );
        vignetteLoopRef.current.start();
      }
    } else {
      vignetteLoopRef.current?.stop();
      vignetteLoopRef.current = null;
      vignetteAnim.setValue(0);
    }

    if (remainingSeconds <= 10 && !shakeTriggeredRef.current) {
      shakeTriggeredRef.current = true;
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 7, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -7, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true })
      ]).start();
    }
  }, [phase, remainingSeconds, vignetteAnim, shakeAnim]);

  useEffect(() => {
    if (phase === "inspection" && !inspectionPlayedRef.current) {
      inspectionPlayedRef.current = true;
      void stopMusic();
      playSound("motherArrival");
      triggerHaptic("warning");

      const screamTimer = setTimeout(() => {
        playSound("scream");
        triggerHaptic("warning");
      }, 900);

      const finishTimer = setTimeout(() => {
        finishInspection();
      }, 2600);

      return () => {
        clearTimeout(screamTimer);
        clearTimeout(finishTimer);
      };
    }

    if (phase === "won" && !victoryPlayedRef.current) {
      victoryPlayedRef.current = true;
      void stopMusic();
      playSound("victory");
      triggerHaptic("success");
    }

    if (phase === "playing") {
      inspectionPlayedRef.current = false;
      victoryPlayedRef.current = false;
    }

    return undefined;
  }, [finishInspection, phase]);

  const handleCleanMess = (messId: string, strokePower: number, now: number) => {
    void startMusic();
    const result = cleanMess(messId, strokePower, now);

    if (result.wrongTool) {
      playSound("wrongTool");
      triggerHaptic("warning");
      return;
    }

    playSound(result.cleanedNow ? "pickup" : "clean");
    triggerHaptic(result.cleanedNow ? "success" : "light");
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <Animated.View
          style={[styles.screen, { transform: [{ translateX: shakeAnim }] }]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setViewport(width, height);
          }}
        >
          <GameCanvas
            level={level}
            messes={messes}
            camera={camera}
            viewport={viewport}
            phase={phase}
            remainingSeconds={remainingSeconds}
            debugMode={debugMode}
            onSetCamera={setCamera}
            onCleanMess={handleCleanMess}
          />

          <View style={styles.topHud} pointerEvents="box-none">
            <TimerBar remainingSeconds={remainingSeconds} totalSeconds={level.timeLimitSeconds} />
            <View style={styles.titleRow}>
              <Text style={styles.title}>{level.title}</Text>
              <Pressable onPress={toggleDebugMode} style={[styles.debugButton, debugMode && styles.debugButtonOn]}>
                <Text style={styles.debugButtonText}>DBG</Text>
              </Pressable>
            </View>
          </View>

          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.vignette, { opacity: vignetteAnim }]}
          />

          {debugMode ? (
            <DebugOverlay
              camera={camera}
              phase={phase}
              remainingMessCount={missedCount}
              remainingSeconds={remainingSeconds}
              selectedTool={selectedTool}
              viewport={viewport}
              world={{ width: level.worldWidth, height: level.worldHeight }}
              messes={messes}
            />
          ) : null}

          <View style={styles.bottomHud}>
            <View style={styles.countRow}>
              <Text style={styles.countText}>Cleaned {cleanedCount}/{messes.length}</Text>
              <Text style={styles.scoreText}>Score {score}</Text>
            </View>
            <ToolSelector
              selectedTool={selectedTool}
              onSelectTool={(tool) => {
                void startMusic();
                setSelectedTool(tool);
              }}
            />
          </View>

          <ResultModal
            visible={phase === "won" || phase === "lost"}
            won={phase === "won"}
            cleanedCount={cleanedCount}
            missedCount={missedCount}
            missedLabels={missedLabels}
            score={score}
            onRetry={retry}
          />
        </Animated.View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  screen: {
    flex: 1,
    backgroundColor: "#241f1a"
  },
  topHud: {
    left: 12,
    position: "absolute",
    right: 12,
    top: 10
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8
  },
  title: {
    backgroundColor: "rgba(255,250,243,0.88)",
    borderRadius: 8,
    color: "#28231f",
    flexShrink: 1,
    fontSize: 15,
    fontFamily: "TitanOne_400Regular",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  vignette: {
    backgroundColor: "#ff1744",
    pointerEvents: "none"
  },
  debugButton: {
    alignItems: "center",
    backgroundColor: "#fffaf3",
    borderColor: "#28231f",
    borderRadius: 8,
    borderWidth: 2,
    height: 36,
    justifyContent: "center",
    marginLeft: 8,
    width: 52
  },
  debugButtonOn: {
    backgroundColor: "#b9ff8a"
  },
  debugButtonText: {
    color: "#28231f",
    fontSize: 12,
    fontWeight: "900"
  },
  bottomHud: {
    backgroundColor: "rgba(255,250,243,0.94)",
    borderTopColor: "#28231f",
    borderTopWidth: 3,
    bottom: 0,
    left: 0,
    padding: 12,
    position: "absolute",
    right: 0
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  countText: {
    color: "#28231f",
    fontSize: 14,
    fontWeight: "900"
  },
  scoreText: {
    color: "#24645d",
    fontSize: 14,
    fontWeight: "900"
  }
});
