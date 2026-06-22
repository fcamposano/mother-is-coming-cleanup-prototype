import { MessRuntimeState } from "../types/gameTypes";

export function getCleanedCount(messes: MessRuntimeState[]) {
  return messes.filter((mess) => mess.cleaned).length;
}

export function getMissedCount(messes: MessRuntimeState[]) {
  return messes.filter((mess) => !mess.cleaned).length;
}

export function getWinBonus(remainingSeconds: number) {
  return Math.max(0, Math.ceil(remainingSeconds) * 8);
}
