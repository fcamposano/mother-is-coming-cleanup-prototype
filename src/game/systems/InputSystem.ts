import { MessRuntimeState } from "../types/gameTypes";

export function findMessAtPoint(
  messes: MessRuntimeState[],
  worldX: number,
  worldY: number
): MessRuntimeState | undefined {
  return messes.find(
    (mess) =>
      !mess.cleaned &&
      worldX >= mess.x &&
      worldX <= mess.x + mess.width &&
      worldY >= mess.y &&
      worldY <= mess.y + mess.height
  );
}
