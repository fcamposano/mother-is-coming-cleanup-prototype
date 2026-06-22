import { Camera } from "../types/gameTypes";

export function clampCamera(
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number,
  worldWidth: number,
  worldHeight: number
): Camera {
  return {
    x: clamp(camera.x, 0, Math.max(0, worldWidth - viewportWidth)),
    y: clamp(camera.y, 0, Math.max(0, worldHeight - viewportHeight))
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
