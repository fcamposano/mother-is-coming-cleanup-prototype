/**
 * process-incoming.mjs
 * Run: node scripts/process-incoming.mjs
 *
 * Picks up files from assets/_incoming/, validates them, resizes if needed,
 * moves them to the correct subfolder, and marks them as production-ready.
 *
 * Naming convention for incoming files:
 *   mess_*.png        → assets/messes/
 *   tool_*.png        → assets/tools/
 *   room_*.png        → assets/rooms/
 *   character_*.png   → assets/characters/
 *   furniture_*.png   → assets/rooms/furniture/
 *   ui_*.png          → assets/ui/
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, statSync } from "fs";
import { createRequire } from "module";
import { dirname, join, basename } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const INCOMING = join(ROOT, "assets/_incoming");

// Target sizes per slot (matches ASSET_PIPELINE.md)
const SLOT_SPECS = {
  // ── Shared mess items ───────────────────────────────────────────────────
  mess_crumbs:          { dir: "messes", w: 440, h: 340 },
  mess_dust:            { dir: "messes", w: 440, h: 340 },
  mess_debris:          { dir: "messes", w: 440, h: 340 },
  mess_juice:           { dir: "messes", w: 440, h: 340 },
  mess_mud:             { dir: "messes", w: 440, h: 340 },
  mess_sticky:          { dir: "messes", w: 440, h: 340 },
  mess_clothes:         { dir: "messes", w: 440, h: 340 },
  mess_toys:            { dir: "messes", w: 440, h: 340 },
  mess_trash:           { dir: "messes", w: 440, h: 340 },
  mess_ignacio_goop:    { dir: "messes", w: 440, h: 340, file: "ignacio-goop.png" },
  mess_ignacio_clothes: { dir: "messes", w: 440, h: 340, file: "ignacio-clothes.png" },
  mess_grease:          { dir: "messes", w: 440, h: 340 },
  mess_broken_egg:      { dir: "messes", w: 440, h: 340, file: "broken-egg.png" },
  mess_vegetable_peel:  { dir: "messes", w: 440, h: 340, file: "vegetable-peel.png" },

  // ── Shared tools ────────────────────────────────────────────────────────
  tool_vacuum:          { dir: "tools", w: 320, h: 320 },
  tool_mop:             { dir: "tools", w: 320, h: 320 },
  tool_hand:            { dir: "tools", w: 320, h: 320 },

  // ── Shared characters ───────────────────────────────────────────────────
  character_mother_kiss:    { dir: "characters", w: 600, h: 1000, file: "mother-kiss.png" },
  character_mother_scream:  { dir: "characters", w: 600, h: 1000, file: "mother-scream.png" },
  character_mother_neutral: { dir: "characters", w: 762, h: 1350, file: "mother-real.png" },

  // ── Room 1: Trini's Room ────────────────────────────────────────────────
  room_trinis_room_bg:          { dir: "rooms/trinis-room", w: 980, h: 1480, file: "background.png" },
  room_trinis_room_bed_left:    { dir: "rooms/trinis-room/furniture", w: 840, h: 640, file: "bed-left.png" },
  room_trinis_room_bed_right:   { dir: "rooms/trinis-room/furniture", w: 840, h: 640, file: "bed-right.png" },
  room_trinis_room_desk:        { dir: "rooms/trinis-room/furniture", w: 280, h: 460, file: "desk.png" },
  room_trinis_room_dresser:     { dir: "rooms/trinis-room/furniture", w: 560, h: 440, file: "dresser.png" },
  room_trinis_room_birdcage:    { dir: "rooms/trinis-room/furniture", w: 360, h: 440, file: "birdcage.png" },
  room_trinis_room_rug:         { dir: "rooms/trinis-room/furniture", w: 1480, h: 960, file: "rug.png" },
  room_trinis_room_window:      { dir: "rooms/trinis-room/furniture", w: 440, h: 400, file: "window.png" },
  room_trinis_room_door:        { dir: "rooms/trinis-room/furniture", w: 360, h: 600, file: "door.png" },

  // ── Room 2: Kitchen ─────────────────────────────────────────────────────
  room_kitchen_bg:      { dir: "rooms/kitchen", w: 980, h: 1480, file: "background.png" },
  room_kitchen_stove:   { dir: "rooms/kitchen/furniture", w: 400, h: 440, file: "stove.png" },
  room_kitchen_sink:    { dir: "rooms/kitchen/furniture", w: 360, h: 280, file: "sink.png" },
  room_kitchen_fridge:  { dir: "rooms/kitchen/furniture", w: 340, h: 500, file: "fridge.png" },
  room_kitchen_table:   { dir: "rooms/kitchen/furniture", w: 480, h: 680, file: "table.png" },

  // ── Room 3: Living Room ─────────────────────────────────────────────────
  room_living_room_bg:           { dir: "rooms/living-room", w: 980, h: 1480, file: "background.png" },
  room_living_room_sofa:         { dir: "rooms/living-room/furniture", w: 700, h: 440, file: "sofa.png" },
  room_living_room_tv_unit:      { dir: "rooms/living-room/furniture", w: 560, h: 240, file: "tv-unit.png" },
  room_living_room_coffee_table: { dir: "rooms/living-room/furniture", w: 400, h: 280, file: "coffee-table.png" },
  room_living_room_bookshelf:    { dir: "rooms/living-room/furniture", w: 200, h: 480, file: "bookshelf.png" },

  // ── UI ──────────────────────────────────────────────────────────────────
  ui_speech_bubble: { dir: "ui", w: 400, h: 240, file: "speech-bubble.png" },
  ui_star_full:     { dir: "ui", w: 120, h: 120, file: "star-full.png" },
  ui_star_empty:    { dir: "ui", w: 120, h: 120, file: "star-empty.png" },
  ui_button_green:  { dir: "ui", w: 480, h: 140, file: "button-green.png" },
  ui_button_red:    { dir: "ui", w: 480, h: 140, file: "button-red.png" },
};

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";

// Derive slot key from filename (strip extension)
function slotKey(filename) {
  return filename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
}

// Derive destination filename from slot key
function destFilename(key, spec) {
  if (spec.file) return spec.file;
  // mess_crumbs → crumbs.png, tool_vacuum → vacuum.png, etc.
  const parts = key.split("_");
  const prefix = parts[0];
  const rest = parts.slice(1).join("-");
  return `${rest}.png`;
}

async function processFile(filename) {
  const key = slotKey(filename);
  const spec = SLOT_SPECS[key];

  if (!spec) {
    console.log(`${YELLOW}⚠  Unknown slot: ${filename} — check ASSET_PIPELINE.md for valid keys${RESET}`);
    return false;
  }

  const srcPath  = join(INCOMING, filename);
  const destDir  = join(ROOT, "assets", spec.dir);
  const destFile = destFilename(key, spec);
  const destPath = join(destDir, destFile);

  mkdirSync(destDir, { recursive: true });

  // Use Python/PIL to validate, convert to RGBA PNG, and resize
  const ok = await validateAndResize(srcPath, destPath, spec, key);
  if (!ok) return false;

  console.log(`${GREEN}✅ Processed: ${filename} → assets/${spec.dir}/${destFile}${RESET}`);

  // Archive the original
  const archiveDir = join(INCOMING, "_processed");
  mkdirSync(archiveDir, { recursive: true });
  renameSync(srcPath, join(archiveDir, filename));

  return true;
}

async function validateAndResize(src, dest, spec, key) {
  const { writeFileSync, unlinkSync } = await import("fs");
  const { tmpdir } = await import("os");

  const scriptPath = join(tmpdir(), "process_asset.py");
  writeFileSync(scriptPath, `
import sys
from PIL import Image
import numpy as np

src = sys.argv[1]
dest = sys.argv[2]
target_w = int(sys.argv[3])
target_h = int(sys.argv[4])
tolerance = 0.25

img = Image.open(src)
print(f"INPUT: {img.size[0]}x{img.size[1]} {img.mode}")
img = img.convert("RGBA")

# Check if background needs removal (< 5% transparent pixels = fully opaque source)
arr = __import__("numpy").array(img)
transparent_ratio = (arr[:,:,3] == 0).sum() / arr[:,:,3].size
if transparent_ratio < 0.05:
    print("REMBG: removing background...")
    from rembg import remove
    img = remove(img)
    print("REMBG: done")

w, h = img.size
if (abs(w - target_w) / target_w > tolerance) or (abs(h - target_h) / target_h > tolerance):
    print(f"RESIZE: {w}x{h} -> {target_w}x{target_h}")
    img = img.resize((target_w, target_h), Image.LANCZOS)
img.save(dest, optimize=True)
print(f"SAVED: {img.size[0]}x{img.size[1]}")
`);

  try {
    const result = execSync(
      `python3 "${scriptPath}" "${src}" "${dest}" ${spec.w} ${spec.h}`,
      { encoding: "utf8" }
    );
    result.trim().split("\n").forEach(line => console.log(`   ${line}`));
    unlinkSync(scriptPath);
    return true;
  } catch (err) {
    console.log(`${RED}❌ Failed to process: ${err.message}${RESET}`);
    try { unlinkSync(scriptPath); } catch {}
    return false;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

if (!existsSync(INCOMING)) {
  mkdirSync(INCOMING, { recursive: true });
  console.log(`Created assets/_incoming/ — drop files here.`);
  process.exit(0);
}

const files = readdirSync(INCOMING).filter(f =>
  /\.(png|jpg|jpeg|webp)$/i.test(f) && !f.startsWith(".")
);

if (files.length === 0) {
  console.log(`\nNo files found in assets/_incoming/`);
  console.log(`Drop PNG files there named after their slot key (e.g. mess_juice.png)\n`);
  process.exit(0);
}

console.log(`\n${BOLD}Processing ${files.length} incoming file(s)...${RESET}\n`);

let success = 0;
for (const file of files) {
  console.log(`${CYAN}→ ${file}${RESET}`);
  const ok = await processFile(file);
  if (ok) success++;
  console.log();
}

console.log(`${BOLD}Done: ${success}/${files.length} processed successfully.${RESET}`);
console.log(`Run ${CYAN}node scripts/validate-assets.mjs${RESET} to see updated status.`);
console.log(`Then rebuild: ${CYAN}npx expo export --platform web --output-dir dist${RESET}\n`);
