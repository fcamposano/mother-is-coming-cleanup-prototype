import { useMemo, useRef } from "react";
import { Image, PanResponder, StyleSheet, Text, View } from "react-native";

import { getAsset } from "../assets/AssetRegistry";
import { clampCamera, screenToWorld } from "../systems/CameraSystem";
import { findMessAtPoint } from "../systems/InputSystem";
import { Camera, GamePhase, LevelDefinition, MessRuntimeState } from "../types/gameTypes";

type GameCanvasProps = {
  level: LevelDefinition;
  messes: MessRuntimeState[];
  camera: Camera;
  viewport: { width: number; height: number };
  phase: GamePhase;
  remainingSeconds: number;
  debugMode: boolean;
  onSetCamera: (camera: Camera) => void;
  onCleanMess: (messId: string, strokePower: number, now: number) => void;
};

type DragMode =
  | { type: "none" }
  | { type: "pan"; startX: number; startY: number; cameraStart: Camera }
  | { type: "clean"; messId: string; lastX: number; lastY: number };

export function GameCanvas({
  level,
  messes,
  camera,
  viewport,
  phase,
  remainingSeconds,
  debugMode,
  onSetCamera,
  onCleanMess
}: GameCanvasProps) {
  const dragModeRef = useRef<DragMode>({ type: "none" });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => phase === "playing",
        onMoveShouldSetPanResponder: () => phase === "playing",
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const worldPoint = screenToWorld(locationX, locationY, cameraRef.current);
          const target = findMessAtPoint(messes, worldPoint.x, worldPoint.y);

          if (target) {
            dragModeRef.current = { type: "clean", messId: target.id, lastX: worldPoint.x, lastY: worldPoint.y };
            onCleanMess(target.id, 14, Date.now());
            return;
          }

          dragModeRef.current = {
            type: "pan",
            startX: locationX,
            startY: locationY,
            cameraStart: cameraRef.current
          };
        },
        onPanResponderMove: (event) => {
          const mode = dragModeRef.current;
          const { locationX, locationY } = event.nativeEvent;

          if (mode.type === "pan") {
            const nextCamera = clampCamera(
              {
                x: mode.cameraStart.x - (locationX - mode.startX),
                y: mode.cameraStart.y - (locationY - mode.startY)
              },
              viewport.width,
              viewport.height,
              level.worldWidth,
              level.worldHeight
            );
            onSetCamera(nextCamera);
            return;
          }

          if (mode.type === "clean") {
            const worldPoint = screenToWorld(locationX, locationY, cameraRef.current);
            const distance = Math.hypot(worldPoint.x - mode.lastX, worldPoint.y - mode.lastY);
            const target = findMessAtPoint(messes, worldPoint.x, worldPoint.y);

            if (target) {
              onCleanMess(target.id, Math.max(8, distance * 0.48), Date.now());
              dragModeRef.current = {
                ...mode,
                messId: target.id,
                lastX: worldPoint.x,
                lastY: worldPoint.y
              };
            }
          }
        },
        onPanResponderRelease: () => {
          dragModeRef.current = { type: "none" };
        },
        onPanResponderTerminate: () => {
          dragModeRef.current = { type: "none" };
        }
      }),
    [debugMode, level.worldHeight, level.worldWidth, messes, onCleanMess, onSetCamera, phase, viewport.height, viewport.width]
  );

  const roomAsset = getAsset(level.roomAssetKey);
  const showInspection = phase === "inspection" || phase === "lost";

  return (
    <View style={styles.viewport} {...panResponder.panHandlers}>
      <View
        style={[
          styles.world,
          {
            width: level.worldWidth,
            height: level.worldHeight,
            backgroundColor: roomAsset.color,
            transform: [{ translateX: -camera.x }, { translateY: -camera.y }]
          }
        ]}
      >
        {roomAsset.image ? <Image source={roomAsset.image} style={styles.roomImage} resizeMode="stretch" /> : <RoomDressing />}
        {messes.map((mess) => (
          <MessView key={mess.id} mess={mess} debugMode={debugMode} showFlag={showInspection && !mess.cleaned} />
        ))}
      </View>
      {phase === "playing" ? <MotherApproach level={level} remainingSeconds={remainingSeconds} /> : null}
      {showInspection ? <Inspector level={level} /> : null}
    </View>
  );
}

function RoomDressing() {
  return (
    <>
      <View style={[styles.furniture, styles.bed]}>
        <Text style={styles.furnitureText}>BED</Text>
      </View>
      <View style={[styles.furniture, styles.desk]}>
        <Text style={styles.furnitureText}>DESK</Text>
      </View>
      <View style={[styles.furniture, styles.rug]}>
        <Text style={styles.furnitureText}>RUG</Text>
      </View>
      <View style={[styles.furniture, styles.window]}>
        <Text style={styles.furnitureText}>WINDOW</Text>
      </View>
      <View style={[styles.furniture, styles.closet]}>
        <Text style={styles.furnitureText}>CLOSET</Text>
      </View>
    </>
  );
}

function MessView({
  mess,
  debugMode,
  showFlag
}: {
  mess: MessRuntimeState;
  debugMode: boolean;
  showFlag: boolean;
}) {
  const asset = getAsset(mess.assetKey);
  const progress = mess.progress / mess.cleanProgressRequired;
  const wrongTool = Date.now() < mess.wrongToolFlashUntil;

  if (mess.cleaned) {
    return (
      <View
        style={[
          styles.cleanedSparkle,
          {
            left: mess.x + mess.width * 0.25,
            top: mess.y + mess.height * 0.25,
            width: mess.width * 0.5,
            height: mess.height * 0.5
          }
        ]}
      >
        <Text style={styles.cleanedText}>DONE</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.mess,
        asset.image ? styles.messWithImage : null,
        {
          left: mess.x,
          top: mess.y,
          width: mess.width,
          height: mess.height,
          backgroundColor: asset.image ? "transparent" : asset.color,
          borderColor: asset.image ? "transparent" : asset.accentColor
        },
        debugMode && styles.debugHitbox,
        wrongTool && styles.wrongTool
      ]}
    >
      {asset.image ? (
        <Image source={asset.image} style={[styles.messImage, { opacity: 1 - progress * 0.72 }]} resizeMode="contain" />
      ) : (
        <View style={styles.messBlob}>
          <Text style={styles.messText}>{asset.placeholderText}</Text>
          <Text style={styles.messLabel}>{mess.label}</Text>
        </View>
      )}
      {asset.image ? <Text style={styles.imageMessLabel}>{mess.label}</Text> : null}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      {wrongTool ? <Text style={styles.wrongText}>wrong tool!</Text> : null}
      {showFlag ? <Text style={styles.flag}>!</Text> : null}
      {debugMode ? <Text style={styles.debugId}>{mess.id}</Text> : null}
    </View>
  );
}

function Inspector({ level }: { level: LevelDefinition }) {
  const asset = getAsset(level.inspector.characterAssetKey);

  return (
    <View style={styles.inspector}>
      {asset.image ? (
        <Image source={asset.image} style={styles.inspectorImage} resizeMode="contain" />
      ) : (
        <View style={[styles.inspectorBody, { backgroundColor: asset.accentColor, borderColor: asset.color }]}>
          <Text style={styles.inspectorText}>{asset.placeholderText}</Text>
        </View>
      )}
      <View style={styles.scoldBubble}>
        <Text style={styles.scoldText}>I can still see it.</Text>
      </View>
    </View>
  );
}

function MotherApproach({ level, remainingSeconds }: { level: LevelDefinition; remainingSeconds: number }) {
  const asset = getAsset(level.inspector.characterAssetKey);
  const progress = Math.max(0, Math.min(1, 1 - remainingSeconds / level.timeLimitSeconds));
  const size = 58 + progress * 138;
  const opacity = 0.34 + progress * 0.62;
  const urgent = remainingSeconds <= 10;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.motherApproach,
        {
          opacity,
          transform: [{ translateY: (1 - progress) * 42 }, { scale: 0.82 + progress * 0.34 }]
        }
      ]}
    >
      <View style={[styles.motherAura, urgent && styles.motherAuraUrgent, { width: size + 18, height: size + 18 }]} />
      {asset.image ? (
        <Image source={asset.image} style={{ width: size, height: size * 1.3 }} resizeMode="contain" />
      ) : (
        <View style={[styles.motherFallback, { width: size, height: size }, { backgroundColor: asset.accentColor }]}>
          <Text style={styles.motherFallbackText}>{asset.placeholderText}</Text>
        </View>
      )}
      <Text style={[styles.motherApproachText, urgent && styles.motherApproachTextUrgent]}>
        {urgent ? "MOTHER IS HERE" : "mother coming"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#241f1a"
  },
  world: {
    position: "absolute"
  },
  roomImage: {
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%"
  },
  furniture: {
    alignItems: "center",
    borderColor: "rgba(40,35,31,0.28)",
    borderRadius: 8,
    borderWidth: 3,
    justifyContent: "center",
    position: "absolute"
  },
  furnitureText: {
    color: "rgba(40,35,31,0.45)",
    fontSize: 18,
    fontWeight: "900"
  },
  bed: {
    backgroundColor: "#b8d4e8",
    height: 280,
    left: 548,
    top: 242,
    width: 330
  },
  desk: {
    backgroundColor: "#dfb57e",
    height: 154,
    left: 74,
    top: 118,
    width: 250
  },
  rug: {
    backgroundColor: "#e9c66f",
    height: 330,
    left: 184,
    top: 458,
    width: 322
  },
  window: {
    backgroundColor: "#bce9ec",
    height: 150,
    left: 684,
    top: 706,
    width: 210
  },
  closet: {
    backgroundColor: "#d6c2aa",
    height: 250,
    left: 500,
    top: 48,
    width: 300
  },
  mess: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 4,
    justifyContent: "center",
    opacity: 0.94,
    padding: 8,
    position: "absolute"
  },
  messWithImage: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    overflow: "visible"
  },
  messImage: {
    height: "100%",
    width: "100%"
  },
  imageMessLabel: {
    backgroundColor: "rgba(40,35,31,0.72)",
    borderRadius: 6,
    bottom: -16,
    color: "#fffaf3",
    fontSize: 10,
    fontWeight: "900",
    left: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: "absolute"
  },
  messBlob: {
    alignItems: "center",
    justifyContent: "center"
  },
  messText: {
    color: "#fffaf3",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  messLabel: {
    color: "#fffaf3",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center"
  },
  progressTrack: {
    backgroundColor: "rgba(255,250,243,0.36)",
    borderRadius: 4,
    bottom: 7,
    height: 8,
    left: 8,
    overflow: "hidden",
    position: "absolute",
    right: 8
  },
  progressFill: {
    backgroundColor: "#fffaf3",
    height: "100%"
  },
  wrongTool: {
    backgroundColor: "rgba(255,23,68,0.12)",
    borderColor: "#ff1744",
    borderWidth: 4,
    transform: [{ rotate: "-2deg" }]
  },
  wrongText: {
    backgroundColor: "#ff1744",
    borderRadius: 6,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: "absolute",
    top: -18
  },
  flag: {
    backgroundColor: "#ff1744",
    borderColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 3,
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    height: 36,
    lineHeight: 30,
    position: "absolute",
    right: -18,
    textAlign: "center",
    top: -18,
    width: 36
  },
  debugHitbox: {
    borderColor: "#00ff66",
    borderWidth: 3
  },
  debugId: {
    backgroundColor: "rgba(0,0,0,0.72)",
    color: "#b9ff8a",
    fontFamily: "Courier",
    fontSize: 11,
    fontWeight: "700",
    left: 0,
    padding: 3,
    position: "absolute",
    top: -22
  },
  cleanedSparkle: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderColor: "#2bb3a3",
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    position: "absolute"
  },
  cleanedText: {
    color: "#24645d",
    fontSize: 11,
    fontWeight: "900"
  },
  inspector: {
    alignItems: "center",
    bottom: 126,
    position: "absolute",
    right: 12
  },
  inspectorBody: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 5,
    height: 240,
    justifyContent: "center",
    width: 178
  },
  inspectorImage: {
    height: 270,
    width: 200
  },
  inspectorText: {
    color: "#28231f",
    fontSize: 40,
    fontWeight: "900"
  },
  scoldBubble: {
    backgroundColor: "#fffaf3",
    borderColor: "#28231f",
    borderRadius: 8,
    borderWidth: 3,
    marginTop: 10,
    padding: 10
  },
  scoldText: {
    color: "#28231f",
    fontSize: 16,
    fontWeight: "900"
  },
  motherApproach: {
    alignItems: "center",
    position: "absolute",
    right: 12,
    top: 112
  },
  motherAura: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderColor: "rgba(255,23,68,0.38)",
    borderRadius: 999,
    borderWidth: 2,
    position: "absolute",
    top: 8
  },
  motherAuraUrgent: {
    backgroundColor: "rgba(255,23,68,0.18)",
    borderColor: "rgba(255,23,68,0.86)",
    borderWidth: 4
  },
  motherFallback: {
    alignItems: "center",
    borderColor: "#28231f",
    borderRadius: 999,
    borderWidth: 3,
    justifyContent: "center"
  },
  motherFallbackText: {
    color: "#28231f",
    fontSize: 18,
    fontWeight: "900"
  },
  motherApproachText: {
    backgroundColor: "rgba(255,250,243,0.9)",
    borderColor: "#28231f",
    borderRadius: 8,
    borderWidth: 2,
    color: "#28231f",
    fontSize: 11,
    fontWeight: "900",
    marginTop: -6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    textTransform: "uppercase"
  },
  motherApproachTextUrgent: {
    backgroundColor: "#ff1744",
    color: "#ffffff"
  }
});
