import { create } from "zustand";

import { levelBedroom } from "../levels/levelBedroom";
import { clampCamera } from "../systems/CameraSystem";
import { applyCleaningStroke, createRuntimeMesses } from "../systems/CleaningSystem";
import { randomizePositions } from "../systems/PositionRandomizer";
import { getCleanedCount, getMissedCount, getWinBonus } from "../systems/ScoringSystem";
import { Camera, GamePhase, LevelDefinition, MessRuntimeState, ToolType } from "../types/gameTypes";

type GameStore = {
  level: LevelDefinition;
  messes: MessRuntimeState[];
  selectedTool: ToolType;
  camera: Camera;
  viewport: { width: number; height: number };
  remainingSeconds: number;
  phase: GamePhase;
  score: number;
  debugMode: boolean;
  inspectionStartedAt?: number;
  surpriseTriggered: boolean;
  surpriseTriggerAt: number;
  setViewport: (width: number, height: number) => void;
  setSelectedTool: (tool: ToolType) => void;
  setCamera: (camera: Camera) => void;
  tick: (deltaSeconds: number) => void;
  cleanMess: (messId: string, strokePower: number, now: number) => { wrongTool: boolean; cleanedNow: boolean };
  toggleDebugMode: () => void;
  startInspection: () => void;
  finishInspection: () => void;
  retry: () => void;
};

const initialMesses = () => createRuntimeMesses(randomizePositions(levelBedroom.messItems));

const SURPRISE_MESSES = [
  {
    id: "ignacio-sticky",
    label: "Ignacio's Goop",
    messType: "wet_spill" as const,
    requiredTool: "mop" as const,
    x: 260, y: 660, width: 160, height: 110,
    assetKey: "mess_sticky",
    cleanProgressRequired: 100,
    scoreValue: 140,
    roomAssociation: "floor"
  },
  {
    id: "ignacio-clothes",
    label: "Ignacio's Clothes",
    messType: "pickup" as const,
    requiredTool: "hand" as const,
    x: 600, y: 540, width: 170, height: 130,
    assetKey: "mess_clothes",
    cleanProgressRequired: 80,
    scoreValue: 120,
    roomAssociation: "floor"
  }
];

// Random trigger between 15–19 seconds remaining
const randomSurpriseTrigger = () => 15 + Math.floor(Math.random() * 5);

export const useGameStore = create<GameStore>((set, get) => ({
  level: levelBedroom,
  messes: initialMesses(),
  selectedTool: "vacuum",
  camera: { x: 0, y: 0 },
  viewport: { width: 390, height: 760 },
  remainingSeconds: levelBedroom.timeLimitSeconds,
  phase: "playing",
  score: 0,
  debugMode: false,
  surpriseTriggered: false,
  surpriseTriggerAt: randomSurpriseTrigger(),
  setViewport: (width, height) =>
    set((state) => ({
      viewport: { width, height },
      camera: clampCamera(state.camera, width, height, state.level.worldWidth, state.level.worldHeight)
    })),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setCamera: (camera) => set({ camera }),
  tick: (deltaSeconds) => {
    const state = get();

    if (state.phase !== "playing") {
      return;
    }

    const remainingSeconds = Math.max(0, state.remainingSeconds - deltaSeconds);

    if (remainingSeconds <= 0) {
      set({ remainingSeconds: 0, phase: "inspection", inspectionStartedAt: Date.now() });
      return;
    }

    if (!state.surpriseTriggered && remainingSeconds <= state.surpriseTriggerAt) {
      const allAlreadyClean = state.messes.every((m) => m.cleaned);
      if (!allAlreadyClean) {
        const newMesses = createRuntimeMesses(SURPRISE_MESSES);
        set({ remainingSeconds, surpriseTriggered: true, messes: [...state.messes, ...newMesses] });
        return;
      }
    }

    set({ remainingSeconds });
  },
  cleanMess: (messId, strokePower, now) => {
    const state = get();

    if (state.phase !== "playing") {
      return { wrongTool: false, cleanedNow: false };
    }

    const { messes, result } = applyCleaningStroke(state.messes, messId, state.selectedTool, strokePower, now);

    if (result.kind === "wrong_tool") {
      set({ messes });
      return { wrongTool: true, cleanedNow: false };
    }

    if (result.kind === "progress") {
      const nextScore = state.score + result.scoreAdded;
      const allClean = messes.every((mess) => mess.cleaned);

      set({
        messes,
        score: allClean ? nextScore + getWinBonus(state.remainingSeconds) : nextScore,
        phase: allClean ? "won" : state.phase
      });

      return { wrongTool: false, cleanedNow: result.cleanedNow };
    }

    return { wrongTool: false, cleanedNow: false };
  },
  toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
  startInspection: () => set({ phase: "inspection", inspectionStartedAt: Date.now() }),
  finishInspection: () => {
    const state = get();
    set({
      phase: getMissedCount(state.messes) > 0 ? "lost" : "won"
    });
  },
  retry: () =>
    set({
      messes: initialMesses(),
      selectedTool: "vacuum",
      camera: { x: 0, y: 0 },
      remainingSeconds: levelBedroom.timeLimitSeconds,
      phase: "playing",
      score: 0,
      inspectionStartedAt: undefined,
      surpriseTriggered: false,
      surpriseTriggerAt: randomSurpriseTrigger()
    })
}));

export const selectCleanedCount = (state: GameStore) => getCleanedCount(state.messes);
export const selectMissedCount = (state: GameStore) => getMissedCount(state.messes);
