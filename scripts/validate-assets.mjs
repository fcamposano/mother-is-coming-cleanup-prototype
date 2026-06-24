/**
 * validate-assets.mjs
 * Run: node scripts/validate-assets.mjs
 * Shows status of every asset slot: placeholder vs production-ready.
 */

import { existsSync, statSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Asset manifest ──────────────────────────────────────────────────────────
// priority: high / medium / low
// generated: true = currently a procedural placeholder
// targetSize: [w, h] in pixels at 1× (game units)

const ASSETS = [
  // ════════════════════════════════════════════════════════════════════════
  // ROOM 1: Trini's Room
  // ════════════════════════════════════════════════════════════════════════
  {
    key: "room_trinis_room_bg",
    file: "rooms/trinis-room/background.png",
    category: "Room 1 / Background",
    generated: true,
    priority: "high",
    targetSize: [980, 1480],
    note: "Trini's Room — full room top-down. Biggest visual impact.",
    legacyFile: "rooms/bedroom-cartoon.png",   // current placeholder location
  },
  {
    key: "room_trinis_room_bed_left",
    file: "rooms/trinis-room/furniture/bed-left.png",
    category: "Room 1 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [840, 640],
    note: "Lavender single bed, top-down",
  },
  {
    key: "room_trinis_room_bed_right",
    file: "rooms/trinis-room/furniture/bed-right.png",
    category: "Room 1 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [840, 640],
    note: "Rose pink single bed, top-down",
  },
  {
    key: "room_trinis_room_birdcage",
    file: "rooms/trinis-room/furniture/birdcage.png",
    category: "Room 1 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [360, 440],
    note: "Birdcage with blue + grey parakeets",
  },
  {
    key: "room_trinis_room_rug",
    file: "rooms/trinis-room/furniture/rug.png",
    category: "Room 1 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [1480, 960],
    note: "Deep red oval rug",
  },
  {
    key: "room_trinis_room_window",
    file: "rooms/trinis-room/furniture/window.png",
    category: "Room 1 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [440, 400],
    note: "Window with white curtains",
  },
  {
    key: "room_trinis_room_door",
    file: "rooms/trinis-room/furniture/door.png",
    category: "Room 1 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [360, 600],
    note: "Wooden door, bottom of room",
  },

  // ════════════════════════════════════════════════════════════════════════
  // ROOM 2: Kitchen (planned)
  // ════════════════════════════════════════════════════════════════════════
  {
    key: "room_kitchen_bg",
    file: "rooms/kitchen/background.png",
    category: "Room 2 / Background",
    generated: false,
    priority: "medium",
    targetSize: [980, 1480],
    note: "Kitchen — white tile floor, blue cabinets, stove, sink, fridge",
  },
  {
    key: "room_kitchen_stove",
    file: "rooms/kitchen/furniture/stove.png",
    category: "Room 2 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [400, 440],
    note: "Stove top-down, 4 burners visible",
  },
  {
    key: "room_kitchen_sink",
    file: "rooms/kitchen/furniture/sink.png",
    category: "Room 2 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [360, 280],
    note: "Stainless sink top-down",
  },
  {
    key: "room_kitchen_fridge",
    file: "rooms/kitchen/furniture/fridge.png",
    category: "Room 2 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [340, 500],
    note: "Fridge top-down, white top panel",
  },
  {
    key: "room_kitchen_table",
    file: "rooms/kitchen/furniture/table.png",
    category: "Room 2 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [480, 680],
    note: "Round kitchen table + 4 chairs top-down",
  },

  // ════════════════════════════════════════════════════════════════════════
  // ROOM 3: Living Room (planned)
  // ════════════════════════════════════════════════════════════════════════
  {
    key: "room_living_room_bg",
    file: "rooms/living-room/background.png",
    category: "Room 3 / Background",
    generated: false,
    priority: "low",
    targetSize: [980, 1480],
    note: "Living room — beige carpet, blue sofa, TV unit, bookshelf",
  },
  {
    key: "room_living_room_sofa",
    file: "rooms/living-room/furniture/sofa.png",
    category: "Room 3 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [700, 440],
    note: "L-shaped sofa top-down, blue fabric",
  },
  {
    key: "room_living_room_tv_unit",
    file: "rooms/living-room/furniture/tv-unit.png",
    category: "Room 3 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [560, 240],
    note: "TV unit + flat screen from above",
  },
  {
    key: "room_living_room_coffee_table",
    file: "rooms/living-room/furniture/coffee-table.png",
    category: "Room 3 / Furniture",
    generated: false,
    priority: "low",
    targetSize: [400, 280],
    note: "Low glass coffee table top-down",
  },

  // ── Mess items (vacuum) ──────────────────────────────────────────────────
  {
    key: "mess_crumbs",
    file: "messes/crumbs.png",
    category: "Mess / Vacuum",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Breadcrumbs & cookie bits, top-down",
  },
  {
    key: "mess_dust",
    file: "messes/dust.png",
    category: "Mess / Vacuum",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Dust bunny cluster, grey-beige",
  },
  {
    key: "mess_debris",
    file: "messes/debris.png",
    category: "Mess / Vacuum",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Mixed dry debris: paper, popcorn, bits",
  },

  // ── Mess items (mop) ─────────────────────────────────────────────────────
  {
    key: "mess_juice",
    file: "messes/juice.png",
    category: "Mess / Mop",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Juice puddle, reddish-pink, wet sheen",
  },
  {
    key: "mess_mud",
    file: "messes/mud.png",
    category: "Mess / Mop",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Muddy shoe prints, 2-3 prints, dark brown",
  },
  {
    key: "mess_sticky",
    file: "messes/sticky.png",
    category: "Mess / Mop",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Honey/caramel sticky spill, golden, glossy",
  },

  // ── Mess items (hand) ────────────────────────────────────────────────────
  {
    key: "mess_clothes",
    file: "messes/clothes.png",
    category: "Mess / Hand",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Clothes pile top-down: t-shirt, shorts, sock",
  },
  {
    key: "mess_toys",
    file: "messes/toys.png",
    category: "Mess / Hand",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Scattered toys: blocks, car, ball",
  },
  {
    key: "mess_trash",
    file: "messes/trash.png",
    category: "Mess / Hand",
    generated: true,
    priority: "high",
    targetSize: [220, 170],
    note: "Trash: crumpled paper, wrappers, bottle cap",
  },

  // ── Surprise mess items (Ignacio) ────────────────────────────────────────
  {
    key: "mess_ignacio_goop",
    file: "messes/ignacio-goop.png",
    category: "Mess / Surprise",
    generated: false,
    priority: "medium",
    targetSize: [220, 170],
    note: "Slime/goo splat — currently uses mess_sticky sprite",
  },
  {
    key: "mess_ignacio_clothes",
    file: "messes/ignacio-clothes.png",
    category: "Mess / Surprise",
    generated: false,
    priority: "medium",
    targetSize: [220, 170],
    note: "Boy clothes pile — currently uses mess_clothes sprite",
  },

  // ── Tools (HUD icons) ────────────────────────────────────────────────────
  {
    key: "tool_vacuum",
    file: "tools/vacuum.png",
    category: "Tool",
    generated: true,
    priority: "medium",
    targetSize: [160, 160],
    note: "Handheld vacuum cleaner, 3/4 view",
  },
  {
    key: "tool_mop",
    file: "tools/mop.png",
    category: "Tool",
    generated: true,
    priority: "medium",
    targetSize: [160, 160],
    note: "Mop + bucket, front 3/4 view",
  },
  {
    key: "tool_hand",
    file: "tools/hand.png",
    category: "Tool",
    generated: true,
    priority: "medium",
    targetSize: [160, 160],
    note: "Yellow rubber glove reaching/grabbing",
  },

  // ── Characters ───────────────────────────────────────────────────────────
  {
    key: "character_mother_neutral",
    file: "characters/mother-real.png",
    category: "Character",
    generated: false,
    priority: "low",
    targetSize: [762, 1350],
    note: "Real photo ✅ — enhance with Topaz Photo AI for even better quality",
  },
  {
    key: "character_mother_kiss",
    file: "characters/mother-kiss.png",
    category: "Character",
    generated: true,
    priority: "medium",
    targetSize: [300, 500],
    note: "Win screen — illustrated: arms up, happy, floating hearts",
  },
  {
    key: "character_mother_scream",
    file: "characters/mother-scream.png",
    category: "Character",
    generated: true,
    priority: "medium",
    targetSize: [300, 500],
    note: "Lose screen — illustrated: hands on cheeks, shocked, shock lines",
  },
  {
    key: "character_ignacio",
    file: "characters/ignacio.png",
    category: "Character",
    generated: false,
    priority: "low",
    targetSize: [281, 380],
    note: "Real photo ✅",
  },

  // ── Furniture (future layered room) ──────────────────────────────────────
  {
    key: "furniture_bed_left",
    file: "rooms/furniture/bed-left.png",
    category: "Furniture",
    generated: false,
    priority: "low",
    targetSize: [420, 320],
    note: "Lavender bed, top-down — needed for layered room upgrade",
  },
  {
    key: "furniture_bed_right",
    file: "rooms/furniture/bed-right.png",
    category: "Furniture",
    generated: false,
    priority: "low",
    targetSize: [420, 320],
    note: "Rose bed, top-down",
  },
  {
    key: "furniture_birdcage",
    file: "rooms/furniture/birdcage.png",
    category: "Furniture",
    generated: false,
    priority: "low",
    targetSize: [180, 220],
    note: "Birdcage with blue + grey parakeets",
  },
];

// ─── Formatting helpers ───────────────────────────────────────────────────────

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const DIM    = "\x1b[2m";

const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

function sizeStr(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function priorityColor(p) {
  if (p === "high")   return RED + "HIGH  " + RESET;
  if (p === "medium") return YELLOW + "MED   " + RESET;
  return DIM + "LOW   " + RESET;
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`\n${BOLD}Trini's Room — Asset Status Report${RESET}`);
console.log(`${"─".repeat(110)}`);
console.log(
  BOLD +
  pad("STATUS", 12) + pad("PRIORITY", 12) + pad("CATEGORY", 18) +
  pad("KEY", 30) + pad("SIZE", 12) + "NOTES" +
  RESET
);
console.log("─".repeat(110));

let ready = 0, placeholder = 0, missing = 0;
let byCategory = {};

for (const asset of ASSETS) {
  const fullPath = join(ROOT, "assets", asset.file);
  const exists = existsSync(fullPath);

  let status, statusColor;
  let sizeInfo = "";

  if (!exists) {
    status = "❌ MISSING";
    statusColor = RED;
    missing++;
  } else if (asset.generated) {
    status = "🔧 PLACEHOLDER";
    statusColor = YELLOW;
    placeholder++;
    const bytes = statSync(fullPath).size;
    sizeInfo = sizeStr(bytes);
  } else {
    status = "✅ READY";
    statusColor = GREEN;
    ready++;
    const bytes = statSync(fullPath).size;
    sizeInfo = sizeStr(bytes);
  }

  const cat = asset.category.split("/")[0].trim();
  byCategory[cat] = byCategory[cat] || { ready: 0, placeholder: 0, missing: 0 };
  if (!exists) byCategory[cat].missing++;
  else if (asset.generated) byCategory[cat].placeholder++;
  else byCategory[cat].ready++;

  console.log(
    statusColor + pad(status, 16) + RESET +
    priorityColor(asset.priority) +
    DIM + pad(asset.category, 18) + RESET +
    CYAN + pad(asset.key, 30) + RESET +
    DIM + pad(sizeInfo, 12) + RESET +
    asset.note
  );
}

console.log("─".repeat(110));
console.log(`\n${BOLD}Summary${RESET}`);
console.log(`  ✅ Ready:       ${GREEN}${ready}${RESET}`);
console.log(`  🔧 Placeholder: ${YELLOW}${placeholder}${RESET}`);
console.log(`  ❌ Missing:     ${RED}${missing}${RESET}`);
console.log(`  Total slots:   ${ASSETS.length}`);

console.log(`\n${BOLD}By category:${RESET}`);
for (const [cat, counts] of Object.entries(byCategory)) {
  console.log(
    `  ${pad(cat, 16)} ` +
    GREEN + `✅${counts.ready} ` + RESET +
    YELLOW + `🔧${counts.placeholder} ` + RESET +
    RED + `❌${counts.missing}` + RESET
  );
}

const incomingDir = join(ROOT, "assets/_incoming");
if (existsSync(incomingDir)) {
  const { readdirSync } = await import("fs");
  const pending = readdirSync(incomingDir).filter(f => f.endsWith(".png") || f.endsWith(".jpg"));
  if (pending.length > 0) {
    console.log(`\n${BOLD}${YELLOW}Incoming files ready to process (run process-incoming.mjs):${RESET}`);
    pending.forEach(f => console.log(`  📥 ${f}`));
  }
}

console.log(`\n${DIM}See ASSET_PIPELINE.md for prompts, specs, and instructions.${RESET}\n`);
