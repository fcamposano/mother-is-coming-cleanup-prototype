import { MessRuntimeState } from "../types/gameTypes";

export function getMissedMesses(messes: MessRuntimeState[]) {
  return messes.filter((mess) => !mess.cleaned);
}
