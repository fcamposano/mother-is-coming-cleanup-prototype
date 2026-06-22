import { MessRuntimeState, ToolType } from "../types/gameTypes";

export type CleanAttemptResult =
  | { kind: "miss" }
  | { kind: "wrong_tool"; messId: string }
  | { kind: "progress"; messId: string; cleanedNow: boolean; scoreAdded: number };

export function applyCleaningStroke(
  messes: MessRuntimeState[],
  messId: string,
  selectedTool: ToolType,
  strokePower: number,
  now: number
): { messes: MessRuntimeState[]; result: CleanAttemptResult } {
  let result: CleanAttemptResult = { kind: "miss" };

  const updated = messes.map((mess) => {
    if (mess.id !== messId || mess.cleaned) {
      return mess;
    }

    if (mess.requiredTool !== selectedTool) {
      result = { kind: "wrong_tool", messId };
      return {
        ...mess,
        wrongToolFlashUntil: now + 420
      };
    }

    const nextProgress = Math.min(mess.cleanProgressRequired, mess.progress + strokePower);
    const cleanedNow = nextProgress >= mess.cleanProgressRequired && !mess.cleaned;
    result = {
      kind: "progress",
      messId,
      cleanedNow,
      scoreAdded: cleanedNow ? mess.scoreValue : 0
    };

    return {
      ...mess,
      progress: nextProgress,
      cleaned: cleanedNow
    };
  });

  return { messes: updated, result };
}

export function createRuntimeMesses(messes: Omit<MessRuntimeState, "progress" | "cleaned" | "wrongToolFlashUntil">[]) {
  return messes.map((mess) => ({
    ...mess,
    progress: 0,
    cleaned: false,
    wrongToolFlashUntil: 0
  }));
}
