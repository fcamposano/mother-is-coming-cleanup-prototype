import { Camera } from "../types/gameTypes";

// Extra scroll allowance so the bottom HUD doesn't hide the last section of the room.
// Must match the actual rendered height of the bottom tool bar in GameScreen.
export const BOTTOM_HUD_HEIGHT = 130;

export function clampCamera(
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number,
  worldWidth: number,
  worldHeight: number
): Camera {
  return {
    x: clamp(camera.x, 0, Math.max(0, worldWidth - viewportWidth)),
    y: clamp(camera.y, 0, Math.max(0, worldHeight - viewportHeight + BOTTOM_HUD_HEIGHT))
  };
}

export function screenToWorld(screenX: number, screenY: number, camera: Camera) {
  return {
    x: screenX + camera.x,
    y: screenY + camera.y
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
