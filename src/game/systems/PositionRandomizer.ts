/**
 * PositionRandomizer — assigns random positions to mess items each game.
 *
 * Zones are defined for Trini's Room (980×1480 world).
 * mop items  → floor only (wet spills don't go on beds)
 * vacuum/hand → floor + furniture surfaces (not walls)
 *
 * Room layout reference:
 *   Left bed:   x:44–422,  y:80–378
 *   Right bed:  x:558–936, y:80–378
 *   Desk:       x:438–542, y:100–310
 *   Dresser:    x:44–302,  y:500–698
 *   Window:     x:730–922, y:490–668
 *   Rug/floor:  x:136–844, y:750–1200
 */

import { MessItemDefinition } from "../types/gameTypes";

type Zone = { x: number; y: number; w: number; h: number };

// ── Zone definitions ──────────────────────────────────────────────────────────

/** Walkable floor areas — safe for mop (wet spills) */
const FLOOR_ZONES: Zone[] = [
  { x: 432, y: 330, w: 116, h: 340 },   // centre corridor between beds
  { x:  70, y: 390, w: 320, h:  96 },   // left floor strip below left bed
  { x: 560, y: 390, w: 340, h:  96 },   // right floor strip below right bed
  { x: 140, y: 710, w: 700, h: 480 },   // main rug/floor
  { x:  70, y: 710, w: 130, h: 480 },   // left side of main floor
  { x: 820, y: 710, w: 120, h: 480 },   // right side of main floor
  { x: 150, y:1200, w: 680, h: 200 },   // lower floor near door
];

/** Furniture surfaces — vacuum / hand items can land here */
const SURFACE_ZONES: Zone[] = [
  { x:  80, y: 110, w: 310, h: 240 },   // left bed surface
  { x: 575, y: 110, w: 330, h: 240 },   // right bed surface
  { x: 450, y: 115, w:  80, h: 175 },   // desk surface
  { x:  60, y: 515, w: 220, h: 160 },   // dresser surface
];

const ALL_ZONES = [...FLOOR_ZONES, ...SURFACE_ZONES];

// ── Helpers ───────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function positionInZone(zone: Zone, w: number, h: number): { x: number; y: number } {
  const x = randInt(zone.x, zone.x + zone.w - w);
  const y = randInt(zone.y, zone.y + zone.h - h);
  return { x, y };
}

function overlaps(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
  margin = 40
): boolean {
  return (
    ax < bx + bw + margin &&
    ax + aw + margin > bx &&
    ay < by + bh + margin &&
    ay + ah + margin > by
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function randomizePositions(items: MessItemDefinition[]): MessItemDefinition[] {
  const placed: Array<{ x: number; y: number; w: number; h: number }> = [];

  return items.map((item) => {
    const zones = item.requiredTool === "mop" ? FLOOR_ZONES : ALL_ZONES;
    const MAX_ATTEMPTS = 60;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const zone = pick(zones);

      // Skip zone if item doesn't fit
      if (zone.w < item.width || zone.h < item.height) continue;

      const { x, y } = positionInZone(zone, item.width, item.height);

      const collision = placed.some((p) =>
        overlaps(x, y, item.width, item.height, p.x, p.y, p.w, p.h)
      );

      if (!collision) {
        placed.push({ x, y, w: item.width, h: item.height });
        return { ...item, x, y };
      }
    }

    // Fallback: keep original position if no valid spot found
    placed.push({ x: item.x, y: item.y, w: item.width, h: item.height });
    return item;
  });
}
