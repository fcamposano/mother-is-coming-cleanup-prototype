import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { getAsset } from "../assets/AssetRegistry";
import { LeaderboardEntry, addEntry, getLeaderboard, qualifies } from "../services/LeaderboardService";

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
  if (!visible) return null;
  if (won) return <WinModal score={score} cleanedCount={cleanedCount} onRetry={onRetry} />;
  return <LoseModal missedCount={missedCount} missedLabels={missedLabels} score={score} onRetry={onRetry} />;
}

function WinModal({ score, cleanedCount, onRetry }: { score: number; cleanedCount: number; onRetry: () => void }) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [newRank, setNewRank] = useState<number | null>(null);
  const [doesQualify] = useState(() => qualifies(score));

  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 14 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0)
    }))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, useNativeDriver: true })
    ]).start();

    // confetti burst
    confettiAnims.forEach((anim, i) => {
      const angle = (i / confettiAnims.length) * Math.PI * 2;
      const dist = 80 + Math.random() * 60;
      Animated.sequence([
        Animated.delay(i * 40),
        Animated.parallel([
          Animated.spring(anim.x, { toValue: Math.cos(angle) * dist, friction: 4, tension: 60, useNativeDriver: true }),
          Animated.spring(anim.y, { toValue: Math.sin(angle) * dist - 20, friction: 4, tension: 60, useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(anim.rotate, { toValue: Math.random() * 4 - 2, duration: 600, useNativeDriver: true })
        ])
      ]).start(() => {
        Animated.timing(anim.opacity, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true }).start();
      });
    });

    if (!doesQualify) {
      setBoard(getLeaderboard());
    }
  }, []);

  const CONFETTI_COLORS = ["#ffd53d", "#ff3355", "#00c8b0", "#a78bfa", "#fb923c", "#34d399", "#f472b6", "#60a5fa"];

  function handleSubmit() {
    const trimmed = name.trim() || "Anonymous";
    const result = addEntry(trimmed, score);
    setBoard(result.board);
    setNewRank(result.rank);
    setSubmitted(true);
  }

  const rankMessage = (rank: number) => {
    if (rank === 1) return "👑 #1 — LEGEND. The room bows to you.";
    if (rank === 2) return "🥈 #2 — So close to the throne!";
    if (rank === 3) return "🥉 #3 — Top three, that's elite.";
    if (rank <= 5) return `🔥 #${rank} — Solid top five, panic cleaner.`;
    return `✨ #${rank} — You made the board!`;
  };

  const kissAsset = getAsset("character_mother_kiss");

  return (
    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
      {/* confetti dots */}
      <View style={styles.confettiOrigin} pointerEvents="none">
        {confettiAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: 10 + (i % 3) * 4,
              height: 10 + (i % 3) * 4,
              borderRadius: i % 2 === 0 ? 99 : 2,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              opacity: anim.opacity,
              transform: [
                { translateX: anim.x },
                { translateY: anim.y },
                { rotate: anim.rotate.interpolate({ inputRange: [-4, 4], outputRange: ["-720deg", "720deg"] }) }
              ]
            }}
          />
        ))}
      </View>

      <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
        {/* Mother kiss portrait + speech bubble */}
        <View style={styles.characterRow}>
          {kissAsset.image
            ? <Image source={kissAsset.image} style={styles.characterImg} resizeMode="contain" />
            : <Text style={styles.characterFallback}>{kissAsset.placeholderText}</Text>}
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>¡Mwah! 💋{"\n"}Está todo limpio...{"\n"}que sorpresa! 🌟</Text>
            <View style={styles.speechTail} />
          </View>
        </View>
        <Text style={styles.winTitle}>Room survived!</Text>
        <Text style={styles.winSub}>Cleaned {cleanedCount} messes · Score {score}</Text>

        {!submitted && doesQualify && (
          <View style={styles.nameSection}>
            <Text style={styles.namePrompt}>🏆 You made the top 10! Enter your name:</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name…"
              placeholderTextColor="#a09080"
              maxLength={20}
              onSubmitEditing={handleSubmit}
              autoFocus
            />
            <Pressable style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Add to leaderboard →</Text>
            </Pressable>
          </View>
        )}

        {!submitted && !doesQualify && (
          <Text style={styles.noQualify}>Not quite top 10 this time — keep practising!</Text>
        )}

        {(submitted || !doesQualify) && board.length > 0 && (
          <View style={styles.leaderboard}>
            <Text style={styles.leaderboardTitle}>🏅 Trini's Room — Top 10</Text>
            {newRank !== null && (
              <Text style={styles.rankMessage}>{rankMessage(newRank)}</Text>
            )}
            {board.map((entry, i) => {
              const isNew = submitted && newRank !== null && i + 1 === newRank;
              return (
                <View key={i} style={[styles.row, isNew && styles.rowNew]}>
                  <Text style={[styles.rowRank, i === 0 && styles.rankGold, i === 1 && styles.rankSilver, i === 2 && styles.rankBronze]}>
                    {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </Text>
                  <Text style={[styles.rowName, isNew && styles.rowNameNew]} numberOfLines={1}>{entry.name}</Text>
                  <Text style={[styles.rowScore, isNew && styles.rowScoreNew]}>{entry.score}</Text>
                  <Text style={styles.rowDate}>{entry.date}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Pressable onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}>Play again 🧹</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function LoseModal({ missedCount, missedLabels, score, onRetry }: { missedCount: number; missedLabels: string[]; score: number; onRetry: () => void }) {
  const screamAsset = getAsset("character_mother_scream");
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        Animated.delay(400)
      ])
    ).start();
  }, [shakeAnim]);

  return (
    <View style={styles.backdrop}>
      <View style={[styles.panel, styles.panelLose]}>
        {/* Screaming mother + speech bubble */}
        <Animated.View style={[styles.characterRow, { transform: [{ translateX: shakeAnim }] }]}>
          {screamAsset.image
            ? <Image source={screamAsset.image} style={styles.characterImg} resizeMode="contain" />
            : <Text style={styles.characterFallback}>{screamAsset.placeholderText}</Text>}
          <View style={[styles.speechBubble, styles.speechBubbleScream]}>
            <Text style={[styles.speechText, styles.speechTextScream]}>Está todo sucio,{"\n"}tengo que hacer{"\n"}todo yo!!!!!! 😱😱😱</Text>
            <View style={[styles.speechTail, styles.speechTailScream]} />
          </View>
        </Animated.View>
        <Text style={styles.loseTitle}>Mom found evidence</Text>
        <Text style={styles.loseSub}>Score {score} · {missedCount} mess{missedCount !== 1 ? "es" : ""} busted</Text>
        <Text style={styles.loseJoke}>
          The red flags are not decorations.{"\n"}Apparently that matters.
        </Text>
        {missedLabels.length > 0 && (
          <View style={styles.missedWrap}>
            <Text style={styles.missedTitle}>Caught red-handed</Text>
            <Text style={styles.missedText}>{missedLabels.join(", ")}</Text>
          </View>
        )}
        <Pressable onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryText}>Retry panic clean 🧹</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(20,10,5,0.72)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    padding: 16,
    position: "absolute",
    right: 0,
    top: 0
  },
  confettiOrigin: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "30%"
  },
  panel: {
    backgroundColor: "#fffaf3",
    borderColor: "#28231f",
    borderRadius: 14,
    borderWidth: 3,
    maxHeight: "92%",
    overflow: "scroll",
    padding: 18,
    width: "100%"
  },
  panelLose: {
    borderColor: "#cc1133"
  },

  // Character portrait row
  characterRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8
  },
  characterImg: {
    height: 140,
    width: 100
  },
  characterFallback: {
    fontSize: 60,
    textAlign: "center",
    width: 100
  },
  speechBubble: {
    backgroundColor: "#fffaf3",
    borderColor: "#28231f",
    borderRadius: 12,
    borderWidth: 2.5,
    flex: 1,
    marginLeft: 10,
    padding: 10,
    position: "relative"
  },
  speechTail: {
    borderBottomColor: "transparent",
    borderBottomWidth: 10,
    borderRightColor: "#28231f",
    borderRightWidth: 14,
    borderTopColor: "transparent",
    borderTopWidth: 10,
    height: 0,
    left: -14,
    position: "absolute",
    top: 18,
    width: 0
  },
  speechText: {
    color: "#28231f",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20
  },
  speechBubbleScream: {
    backgroundColor: "#fff0f2",
    borderColor: "#cc1133"
  },
  speechTailScream: {
    borderRightColor: "#cc1133"
  },
  speechTextScream: {
    color: "#9d1829",
    fontWeight: "900"
  },

  winTitle: {
    color: "#28231f",
    fontFamily: "TitanOne_400Regular",
    fontSize: 28,
    textAlign: "center"
  },
  winSub: {
    color: "#6d6258",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center"
  },

  // Name entry
  nameSection: { marginTop: 16 },
  namePrompt: {
    color: "#28231f",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center"
  },
  nameInput: {
    backgroundColor: "#f0e2cf",
    borderColor: "#28231f",
    borderRadius: 8,
    borderWidth: 2,
    color: "#28231f",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: "center"
  },
  submitBtn: {
    alignItems: "center",
    backgroundColor: "#00c8b0",
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900"
  },
  noQualify: {
    color: "#6d6258",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center"
  },

  // Leaderboard
  leaderboard: { marginTop: 16 },
  leaderboardTitle: {
    color: "#28231f",
    fontFamily: "TitanOne_400Regular",
    fontSize: 15,
    marginBottom: 6,
    textAlign: "center"
  },
  rankMessage: {
    backgroundColor: "#fef3c7",
    borderColor: "#fbbf24",
    borderRadius: 6,
    borderWidth: 1,
    color: "#92400e",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: "center"
  },
  row: {
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 5
  },
  rowNew: {
    backgroundColor: "#fef9c3",
    borderColor: "#fbbf24",
    borderWidth: 1.5
  },
  rowRank: {
    color: "#6d6258",
    fontSize: 12,
    fontWeight: "800",
    width: 28
  },
  rankGold: { color: "#b45309" },
  rankSilver: { color: "#6b7280" },
  rankBronze: { color: "#92400e" },
  rowName: {
    color: "#28231f",
    flex: 1,
    fontSize: 13,
    fontWeight: "700"
  },
  rowNameNew: { color: "#92400e", fontWeight: "900" },
  rowScore: {
    color: "#24645d",
    fontSize: 13,
    fontWeight: "800",
    width: 44,
    textAlign: "right"
  },
  rowScoreNew: { color: "#b45309" },
  rowDate: {
    color: "#a09080",
    fontSize: 10,
    fontWeight: "600",
    width: 38,
    textAlign: "right"
  },

  loseTitle: {
    color: "#9d1829",
    fontFamily: "TitanOne_400Regular",
    fontSize: 26,
    textAlign: "center"
  },
  loseSub: {
    color: "#6d6258",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center"
  },
  loseJoke: {
    color: "#5a5149",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 10,
    textAlign: "center"
  },
  missedWrap: {
    backgroundColor: "#ffe0e5",
    borderColor: "#ff4159",
    borderRadius: 8,
    borderWidth: 1.5,
    marginTop: 12,
    padding: 10
  },
  missedTitle: {
    color: "#9d1829",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  missedText: {
    color: "#5a252b",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 3
  },

  // Shared
  retry: {
    alignItems: "center",
    backgroundColor: "#28231f",
    borderRadius: 8,
    marginTop: 16,
    padding: 14
  },
  retryText: {
    color: "#fffaf3",
    fontSize: 15,
    fontWeight: "900"
  }
});
