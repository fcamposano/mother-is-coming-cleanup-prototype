import { useMemo, useRef } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

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
        <RoomDressing />
        {messes.map((mess) => (
          <MessView key={mess.id} mess={mess} debugMode={debugMode} showFlag={showInspection && !mess.cleaned} />
        ))}
        {showInspection ? <Inspector level={level} /> : null}
      </View>
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
        debugMode && styles.debugHitbox,
        wrongTool && styles.wrongTool,
        {
          left: mess.x,
          top: mess.y,
          width: mess.width,
          height: mess.height,
          backgroundColor: asset.color,
          borderColor: asset.accentColor
        }
      ]}
    >
      <View style={styles.messBlob}>
        <Text style={styles.messText}>{asset.placeholderText}</Text>
        <Text style={styles.messLabel}>{mess.label}</Text>
      </View>
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
      <View style={[styles.inspectorBody, { backgroundColor: asset.accentColor, borderColor: asset.color }]}>
        <Text style={styles.inspectorText}>{asset.placeholderText}</Text>
      </View>
      <View style={styles.scoldBubble}>
        <Text style={styles.scoldText}>I can still see it.</Text>
      </View>
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
    borderColor: "#ff1744",
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
    borderColor: "#00ff66"
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
    left: 266,
    position: "absolute",
    top: 820
  },
  inspectorBody: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 5,
    height: 240,
    justifyContent: "center",
    width: 178
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
  }
});
