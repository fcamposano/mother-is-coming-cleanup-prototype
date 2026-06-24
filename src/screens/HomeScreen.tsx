import { useEffect, useRef, useState } from "react";
import { Animated, Image, ImageSourcePropType, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { AssetRegistry } from "../game/assets/AssetRegistry";
import { unlockAudio } from "../game/systems/AudioSystem";
import { getLeaderboard, LeaderboardEntry } from "../game/services/LeaderboardService";

type Room = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  icon?: ImageSourcePropType;
  color: string;
  accentColor: string;
  available: boolean;
};

const ROOMS: Room[] = [
  {
    id: "trinis-room",
    title: "Trini's Room",
    subtitle: "9 messes · 50 sec",
    emoji: "🛏️",
    icon: AssetRegistry.room_trinis_room_icon.image,
    color: "#5b8f8f",
    accentColor: "#f8efe0",
    available: true
  },
  {
    id: "felipes-room",
    title: "Felipe's Room",
    subtitle: "Coming soon",
    emoji: "🛏️",
    icon: AssetRegistry.room_felipes_room_icon.image,
    color: "#9a6b36",
    accentColor: "#fdf5e4",
    available: false
  },
  {
    id: "living-room",
    title: "Living Room",
    subtitle: "Coming soon",
    emoji: "🛋️",
    color: "#4a72d9",
    accentColor: "#eef2ff",
    available: false
  }
];

type Props = { onStartRoom: (roomId: string) => void };

export function HomeScreen({ onStartRoom }: Props) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const titleBounce = useRef(new Animated.Value(0)).current;

  const birdBounce = useRef(new Animated.Value(0)).current;
  const motherSlide = useRef(new Animated.Value(60)).current;
  const motherOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void getLeaderboard().then(setBoard);

    Animated.loop(
      Animated.sequence([
        Animated.timing(titleBounce, { toValue: -6, duration: 700, useNativeDriver: true }),
        Animated.timing(titleBounce, { toValue: 0, duration: 700, useNativeDriver: true })
      ])
    ).start();

    // Birds hop out of sync
    Animated.loop(
      Animated.sequence([
        Animated.timing(birdBounce, { toValue: -8, duration: 400, useNativeDriver: true }),
        Animated.timing(birdBounce, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(300)
      ])
    ).start();

    // Mother slides in on mount
    Animated.parallel([
      Animated.spring(motherSlide, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
      Animated.timing(motherOpacity, { toValue: 1, duration: 400, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={styles.hero}>
          {/* Parakeets — left side */}
          <View style={styles.birdsCol}>
            <Animated.View style={{ transform: [{ translateY: birdBounce }] }}>
              <Image
                source={AssetRegistry.character_parakeet_blue.image}
                style={styles.birdImg}
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.View style={{ transform: [{ translateY: birdBounce }], marginTop: -12 }}>
              <Image
                source={AssetRegistry.character_parakeet_gray.image}
                style={[styles.birdImg, { transform: [{ scaleX: -1 }] }]}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Title — center */}
          <View style={styles.titleCol}>
            <Animated.Text style={[styles.title, { transform: [{ translateY: titleBounce }] }]}>
              🧹 Mother{"\n"}Is Coming
            </Animated.Text>
            <Text style={styles.subtitle}>Clean before she arrives!</Text>
          </View>

          {/* Mother — right side */}
          <Animated.View style={[styles.motherCol, { opacity: motherOpacity, transform: [{ translateY: motherSlide }] }]}>
            <Image
              source={AssetRegistry.character_mother_neutral.image}
              style={styles.motherImg}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Room cards */}
        <Text style={styles.sectionLabel}>Choose a Room</Text>
        <View style={styles.roomGrid}>
          {ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} onPress={() => {
              if (!room.available) return;
              void unlockAudio();
              onStartRoom(room.id);
            }} />
          ))}
        </View>

        {/* Leaderboard */}
        <Text style={styles.sectionLabel}>🏅 Hall of Fame — Trini's Room</Text>
        <View style={styles.board}>
          {board.length === 0 && (
            <Text style={styles.boardEmpty}>No scores yet — be the first!</Text>
          )}
          {board.map((entry, i) => (
            <View key={i} style={[styles.boardRow, i % 2 === 0 && styles.boardRowAlt]}>
              <Text style={[styles.boardRank, i === 0 && styles.gold, i === 1 && styles.silver, i === 2 && styles.bronze]}>
                {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </Text>
              <Text style={styles.boardName} numberOfLines={1}>{entry.name}</Text>
              <Text style={styles.boardScore}>{entry.score}</Text>
              <Text style={styles.boardDate}>{entry.date}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>¡Que no llegue la mamá! 😱</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoomCard({ room, onPress }: { room: Room; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    if (!room.available) return;
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  }

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={styles.cardWrapper}>
      <Animated.View style={[
        styles.card,
        { backgroundColor: room.available ? room.color : "#ccc" },
        { transform: [{ scale }] }
      ]}>
        {room.icon
          ? <Image source={room.icon} style={styles.cardIcon} resizeMode="contain" />
          : <Text style={styles.cardEmoji}>{room.emoji}</Text>
        }
        <Text style={[styles.cardTitle, { color: room.available ? room.accentColor : "#888" }]}>
          {room.title}
        </Text>
        <Text style={[styles.cardSub, { color: room.available ? room.accentColor : "#aaa" }]}>
          {room.subtitle}
        </Text>
        {!room.available && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>🔒</Text>
          </View>
        )}
        {room.available && (
          <View style={styles.playBadge}>
            <Text style={styles.playText}>▶ PLAY</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fdf6ec" },
  scroll: { alignItems: "center", paddingHorizontal: 20, paddingTop: 32, paddingBottom: 48 },

  hero: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 28,
    minHeight: 180
  },
  birdsCol: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 72,
    paddingBottom: 8
  },
  birdImg: {
    width: 64,
    height: 80
  },
  titleCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8
  },
  motherCol: {
    width: 88,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  motherImg: {
    width: 88,
    height: 180
  },
  title: {
    fontFamily: "TitanOne_400Regular",
    fontSize: 26,
    color: "#2c2c2c",
    textAlign: "center",
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: "#886644",
    textAlign: "center"
  },

  sectionLabel: {
    fontFamily: "TitanOne_400Regular",
    fontSize: 16,
    color: "#5b4a30",
    alignSelf: "flex-start",
    marginBottom: 12,
    marginTop: 8
  },

  roomGrid: { flexDirection: "row", gap: 12, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" },

  cardWrapper: { width: 160 },
  card: {
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minHeight: 170
  },
  cardEmoji: { fontSize: 40, marginBottom: 8 },
  cardIcon: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  cardTitle: { fontFamily: "TitanOne_400Regular", fontSize: 15, textAlign: "center", marginBottom: 4 },
  cardSub: { fontSize: 11, textAlign: "center", opacity: 0.85 },
  lockBadge: {
    marginTop: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  lockText: { fontSize: 14 },
  playBadge: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5
  },
  playText: { fontSize: 12, color: "#fff", fontFamily: "TitanOne_400Regular", letterSpacing: 1 },

  board: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 32
  },
  boardEmpty: { padding: 24, textAlign: "center", color: "#aaa", fontStyle: "italic" },
  boardRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, gap: 8 },
  boardRowAlt: { backgroundColor: "#fdf6ec" },
  boardRank: { width: 30, fontSize: 15, textAlign: "center" },
  gold: { color: "#f5a623" },
  silver: { color: "#9b9b9b" },
  bronze: { color: "#b87333" },
  boardName: { flex: 1, fontSize: 14, color: "#2c2c2c", fontWeight: "600" },
  boardScore: { fontSize: 14, fontWeight: "700", color: "#5b8f8f", width: 52, textAlign: "right" },
  boardDate: { fontSize: 11, color: "#aaa", width: 54, textAlign: "right" },

  footer: { fontSize: 13, color: "#c09060", fontStyle: "italic", marginTop: 8 }
});
