/**
 * PositionRandomizer — assigns random positions to mess items each game.
 *
 * Strategy: the room is split into 9 named slots covering the full playable
 * area. Each game the slots are shuffled and assigned one per item, guaranteeing
 * spread. Within each slot, position is random but must satisfy the item's
 * tool constraint (mop → floor only) and must not overlap other items.
 *
 * Room dimensions: 980 × 1480 world units.
 *
 * Layout reference:
 *   Left bed:    x:44–422,   y:80–378
 *   Right bed:   x:558–936,  y:80–378
 *   Desk:        x:438–542,  y:100–310
 *   Dresser:     x:44–302,   y:500–698
 *   Window:      x:730–922,  y:490–668
 *   Rug/floor:   x:136–844,  y:750–1200
 *   Door area:   x:340–640,  y:1200–1420
 */

import { MessItemDefinition } from "../types/gameTypes";

type Zone = { x: number; y: number; w: number; h: number; surface?: boolean };

// ── Slot definitions ──────────────────────────────────────────────────────────
// 9 slots, one per mess item. Each slot is a region with candidate sub-zones.
// `surface: true` zones = furniture tops (beds/desk/dresser) — not valid for mop.

const SLOTS: Array<{ name: string; zones: Zone[] }> = [
  {
    name: "left_bed",
    zones: [
      { x: 80,  y: 110, w: 310, h: 240, surface: true },   // bed surface
      { x: 70,  y: 390, w: 320, h: 96  },                   // floor below left bed
    ]
  },
  {
    name: "desk_top",
    zones: [
      { x: 442, y: 115, w:  88, h: 175, surface: true },    // desk surface
      { x: 430, y: 310, w: 120, h: 120  },                   // floor below desk
    ]
  },
  {
    name: "right_bed",
    zones: [
      { x: 575, y: 110, w: 330, h: 240, surface: true },    // bed surface
      { x: 560, y: 390, w: 340, h: 96  },                   // floor below right bed
    ]
  },
  {
    name: "dresser_area",
    zones: [
      { x: 60,  y: 515, w: 220, h: 155, surface: true },    // dresser surface
      { x: 60,  y: 680, w: 280, h: 110  },                  // floor beside dresser
    ]
  },
  {
    name: "corridor",
    zones: [
      { x: 432, y: 340, w: 116, h: 360  },                  // centre corridor
    ]
  },
  {
    name: "window_side",
    zones: [
      { x: 600, y: 490, w: 280, h: 220  },                  // floor near window
    ]
  },
  {
    name: "rug_left",
    zones: [
      { x: 100, y: 720, w: 360, h: 440  },                  // left half of rug
    ]
  },
  {
    name: "rug_right",
    zones: [
      { x: 500, y: 720, w: 380, h: 440  },                  // right half of rug
    ]
  },
  {
    name: "lower_floor",
    zones: [
      { x: 150, y:1180, w: 680, h: 220  },                  // near door
    ]
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function overlaps(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
  margin = 50
): boolean {
  return (
    ax < bx + bw + margin &&
    ax + aw + margin > bx &&
    ay < by + bh + margin &&
    ay + ah + margin > by
  );
}

function tryPlaceInZone(
  zone: Zone,
  iw: number,
  ih: number,
  isMop: boolean,
  placed: Array<{ x: number; y: number; w: number; h: number }>,
  attempts: number
): { x: number; y: number } | null {
  // Mop items cannot go on furniture surfaces
  if (isMop && zone.surface) return null;
  // Zone must be large enough to fit the item
  if (zone.w < iw + 10 || zone.h < ih + 10) return null;

  for (let i = 0; i < attempts; i++) {
    const x = randInt(zone.x, zone.x + zone.w - iw);
    const y = randInt(zone.y, zone.y + zone.h - ih);
    const collision = placed.some(p => overlaps(x, y, iw, ih, p.x, p.y, p.w, p.h));
    if (!collision) return { x, y };
  }
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function randomizePositions(items: MessItemDefinition[]): MessItemDefinition[] {
  // Shuffle slots so each run assigns different slots to different items
  const shuffledSlots = shuffle(SLOTS);
  const placed: Array<{ x: number; y: number; w: number; h: number }> = [];

  return items.map((item, idx) => {
    const isMop = item.requiredTool === "mop";
    const iw = item.width;
    const ih = item.height;

    // Try the assigned slot first (guarantees spread)
    const assignedSlot = shuffledSlots[idx % shuffledSlots.length];
    const slotZones = shuffle(assignedSlot.zones);

    for (const zone of slotZones) {
      const pos = tryPlaceInZone(zone, iw, ih, isMop, placed, 20);
      if (pos) {
        placed.push({ x: pos.x, y: pos.y, w: iw, h: ih });
        return { ...item, ...pos };
      }
    }

    // Fallback: try all other slots in shuffled order
    const fallbackSlots = shuffle(SLOTS.filter(s => s.name !== assignedSlot.name));
    for (const slot of fallbackSlots) {
      for (const zone of shuffle(slot.zones)) {
        const pos = tryPlaceInZone(zone, iw, ih, isMop, placed, 15);
        if (pos) {
          placed.push({ x: pos.x, y: pos.y, w: iw, h: ih });
          return { ...item, ...pos };
        }
      }
    }

    // Last resort: keep original position
    placed.push({ x: item.x, y: item.y, w: iw, h: ih });
    return item;
  });
}
