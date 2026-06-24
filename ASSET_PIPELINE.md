# Asset Pipeline — Mother Is Coming: Cleanup Game

Run `node scripts/validate-assets.mjs` at any time to see which assets are placeholders vs production-ready.

To add a new asset: drop the file in `assets/_incoming/` named exactly as the slot key (e.g. `room_trinis_room_bg.png`), then run `node scripts/process-incoming.mjs`.

---

## Architecture: Rooms as independent levels

Each **Room** is a self-contained game level with:
- Its own **background image** (full room painted top-down)
- Its own **furniture sprites** (layered on top of background)
- Its own **level definition file** (`src/game/levels/level<RoomName>.ts`) defining mess positions, timer, inspector
- Its own **color palette** (so each room feels visually distinct)

**Mess items, tools, characters, and audio are shared across all rooms.**

```
assets/
  rooms/
    trinis-room/
      background.png        ← full room 980×1480
      furniture/
        bed-left.png
        bed-right.png
        desk.png
        dresser.png
        birdcage.png
        rug.png
        window.png
        door.png
    kitchen/
      background.png
      furniture/
        stove.png
        sink.png
        table.png
        fridge.png
        ...
    living-room/
      background.png
      furniture/
        sofa.png
        tv.png
        coffee-table.png
        ...
  messes/           ← shared across all rooms
  tools/            ← shared across all rooms
  characters/       ← shared across all rooms
  audio/            ← shared across all rooms
```

Asset registry key pattern:
- `room_<id>_bg` — background image
- `room_<id>_<furniture>` — individual furniture piece
- `mess_<type>` — mess item (shared)
- `tool_<type>` — tool (shared)
- `character_<name>_<expression>` — character (shared)

---

## Style Guide — ALL assets must follow this

| Property | Value |
|---|---|
| **Art style** | 2D cartoon, top-down view (camera looks straight down at ~15° tilt). Think "board game pieces seen from above." |
| **Outline** | Thick black outline, 3–5px equivalent at 1×. Every element has a clear edge. |
| **Colors** | Saturated, warm palette. No photorealistic textures. Flat fills with 1–2 highlight spots. |
| **Lighting** | Implied top-left soft light. No hard shadows. Mild drop shadow under objects (semi-transparent black offset 4px down-right). |
| **Background** | **Transparent PNG for all mess, character, tool, and furniture assets.** |
| **Room background** | Solid colors + simple shapes — RGB, no transparency needed. |
| **File format** | PNG, 32-bit RGBA (except room background which can be RGB). |
| **Compression** | Optimize with pngquant or similar. Target < 150 KB per asset, < 400 KB for room backgrounds. |
| **Canvas size** | Deliver at 2× (retina). Game renders at 1×. E.g. mess items: deliver 440×340, game uses 220×170. |

**AI prompt base (prepend to every mess/furniture request):**
```
Top-down 2D cartoon game asset, thick black outline 4px, transparent PNG background,
flat saturated colors with single highlight spot, mild drop shadow offset 4px bottom-right,
casual mobile game art style similar to Homescapes or Township, [SPECIFIC DESCRIPTION],
[WIDTH]x[HEIGHT]px
```

---

## ROOM 1: Trini's Room (`room_trinis_room`)
**Palette:** lavender `#b8a4d8` · rose `#e8a4b4` · red rug `#c43050` · warm wood `#e8d8b8` · cream walls `#f0e8d8`

### Background

| Slot key | File | Status | Size | AI Prompt |
|---|---|---|---|---|
| `room_trinis_room_bg` | `rooms/trinis-room/background.png` | 🔧 placeholder | 980×1480 | Top-down cartoon bedroom, two parallel single beds (left: lavender headboard, right: rose headboard), small wooden desk between them at top, large deep red oval rug center floor, wooden dresser left wall, window with white curtains upper right, wooden door bottom center, warm oak wood floor planks, cream walls, no characters, no mess items, RGB PNG 980×1480px |

### Furniture sprites (layered over background — future upgrade)

| Slot key | File | Status | Size | Description for AI |
|---|---|---|---|---|
| `room_trinis_room_bed_left` | `rooms/trinis-room/furniture/bed-left.png` | ❌ | 840×640 | Single bed top-down, lavender headboard, white pillow, soft duvet with small pattern, wooden frame, transparent bg |
| `room_trinis_room_bed_right` | `rooms/trinis-room/furniture/bed-right.png` | ❌ | 840×640 | Single bed top-down, rose pink headboard, white pillow, light pink duvet, transparent bg |
| `room_trinis_room_desk` | `rooms/trinis-room/furniture/desk.png` | ❌ | 280×460 | Small wooden desk top-down, light oak, empty surface, transparent bg |
| `room_trinis_room_dresser` | `rooms/trinis-room/furniture/dresser.png` | ❌ | 560×440 | Wooden dresser top-down, 3 drawers visible from above, warm oak color, transparent bg |
| `room_trinis_room_birdcage` | `rooms/trinis-room/furniture/birdcage.png` | ❌ | 360×440 | Round birdcage top-down, metal bars visible, two small parakeets (one blue, one grey), small perch, transparent bg |
| `room_trinis_room_rug` | `rooms/trinis-room/furniture/rug.png` | ❌ | 1480×960 | Oval rug top-down, deep red `#c43050`, simple cream border pattern, transparent bg |
| `room_trinis_room_window` | `rooms/trinis-room/furniture/window.png` | ❌ | 440×400 | Window top-down inset in wall, white frame, light blue glass, white flowing curtains on sides, transparent bg |
| `room_trinis_room_door` | `rooms/trinis-room/furniture/door.png` | ❌ | 360×600 | Wooden door top-down view from above, brown, round golden knob, subtle shadow at base, transparent bg |

---

## ROOM 2: Kitchen (`room_kitchen`) — PLANNED
**Palette (suggested):** tile white `#f5f5f0` · cabinet blue `#4a7fa5` · counter grey `#c8c8c0` · accent yellow `#ffd53d`

| Slot key | File | Status | Size | Description for AI |
|---|---|---|---|---|
| `room_kitchen_bg` | `rooms/kitchen/background.png` | ❌ | 980×1480 | Top-down cartoon kitchen, white tile floor with grey grout lines, blue cabinets along walls, kitchen island center, stainless sink top-right, stove with burners top-left, fridge upper corner, no characters, no mess |
| `room_kitchen_stove` | `rooms/kitchen/furniture/stove.png` | ❌ | 400×440 | Kitchen stove top-down, 4 burner rings visible from above, black/grey, transparent bg |
| `room_kitchen_sink` | `rooms/kitchen/furniture/sink.png` | ❌ | 360×280 | Kitchen sink top-down, stainless steel basin, chrome faucet, transparent bg |
| `room_kitchen_fridge` | `rooms/kitchen/furniture/fridge.png` | ❌ | 340×500 | Refrigerator top-down, white top panel, handle visible, transparent bg |
| `room_kitchen_table` | `rooms/kitchen/furniture/table.png` | ❌ | 480×680 | Round kitchen table top-down, wood surface, 4 chairs around it visible from above, transparent bg |

### Kitchen-specific mess items (if different from bedroom)
Kitchen may reuse most shared messes. Additional:

| Slot key | File | Status | Tool | Description for AI |
|---|---|---|---|---|
| `mess_grease` | `messes/grease.png` | ❌ | mop | Greasy splatter on floor/counter, yellowish translucent blob, oil sheen highlight |
| `mess_broken_egg` | `messes/broken-egg.png` | ❌ | mop | Broken egg splat top-down, yellow yolk + clear whites, cracked shell pieces |
| `mess_vegetable_peel` | `messes/vegetable-peel.png` | ❌ | hand | Pile of vegetable peels and scraps top-down, colourful mix |

---

## ROOM 3: Living Room (`room_living_room`) — PLANNED
**Palette (suggested):** carpet beige `#d8c8a8` · sofa blue `#3a5a8a` · wall warm grey `#d8d0c8` · wood `#c8a870`

| Slot key | File | Status | Size | Description for AI |
|---|---|---|---|---|
| `room_living_room_bg` | `rooms/living-room/background.png` | ❌ | 980×1480 | Top-down cartoon living room, large beige carpet center, blue L-shaped sofa upper area, low coffee table, TV unit against wall, bookshelf one side, no characters, no mess |
| `room_living_room_sofa` | `rooms/living-room/furniture/sofa.png` | ❌ | 700×440 | L-shaped sofa top-down, blue fabric, cushions visible, transparent bg |
| `room_living_room_tv_unit` | `rooms/living-room/furniture/tv-unit.png` | ❌ | 560×240 | TV unit top-down, flat screen TV from above, wooden cabinet below, transparent bg |
| `room_living_room_coffee_table` | `rooms/living-room/furniture/coffee-table.png` | ❌ | 400×280 | Low coffee table top-down, glass surface, wooden frame, transparent bg |
| `room_living_room_bookshelf` | `rooms/living-room/furniture/bookshelf.png` | ❌ | 200×480 | Bookshelf top-down, books of various colors visible from above, transparent bg |

---

## SHARED ASSETS (all rooms)

### Mess Items
Each mess: **440×340 px** delivered, game renders at 220×170. Top-down view. Transparent PNG.

| Slot key | File | Status | Tool | Description for AI |
|---|---|---|---|---|
| `mess_crumbs` | `messes/crumbs.png` | 🔧 | vacuum | Scattered breadcrumbs and cookie bits on floor, top-down, warm brown tones, various sizes |
| `mess_dust` | `messes/dust.png` | 🔧 | vacuum | Fluffy dust bunny cluster, grey-beige, with tiny debris specks and a small feather |
| `mess_debris` | `messes/debris.png` | 🔧 | vacuum | Mixed dry debris: paper scraps, popcorn kernel, small plastic bits, top-down |
| `mess_juice` | `messes/juice.png` | 🔧 | mop | Spilled juice puddle, reddish-pink, irregular blob shape, wet sheen highlight, drip edges |
| `mess_mud` | `messes/mud.png` | 🔧 | mop | Muddy shoe footprints track, 2–3 shoe prints, dark brown, slightly wet look |
| `mess_sticky` | `messes/sticky.png` | 🔧 | mop | Honey/caramel sticky spill, golden amber, glossy highlight, drip edges |
| `mess_clothes` | `messes/clothes.png` | 🔧 | hand | Pile of clothes top-down: t-shirt, shorts, sock visible, colorful mix |
| `mess_toys` | `messes/toys.png` | 🔧 | hand | Scattered toys: building blocks, small toy car, bouncy ball, top-down |
| `mess_trash` | `messes/trash.png` | 🔧 | hand | Trash pile top-down: crumpled paper, candy wrapper, empty bottle cap, small box |
| `mess_ignacio_goop` | `messes/ignacio-goop.png` | ❌ | mop | Slime/goo splat, green-yellow, bubbly texture, top-down splash shape |
| `mess_ignacio_clothes` | `messes/ignacio-clothes.png` | ❌ | hand | Boy's clothes pile: grey-blue Jeep t-shirt, dark shorts, one sock, top-down |

**AI prompt template:**
```
Top-down 2D cartoon illustration of [DESCRIPTION], transparent PNG background,
thick black outline 4px, warm saturated colors, flat shading with one bright highlight,
mild drop shadow, casual mobile game asset style, 440x340px
```

### Tools (HUD icons)
**320×320 px** delivered, renders at 80×80 in HUD. Front 3/4 view. Transparent PNG.

| Slot key | File | Status | Description for AI |
|---|---|---|---|
| `tool_vacuum` | `tools/vacuum.png` | 🔧 | Cartoon handheld vacuum cleaner, blue body, 3/4 front view, suction nozzle pointing left, thick outlines |
| `tool_mop` | `tools/mop.png` | 🔧 | Cartoon mop with blue squeeze bucket, front 3/4 view, white mop head, wooden handle, water droplets |
| `tool_hand` | `tools/hand.png` | 🔧 | Cartoon yellow rubber cleaning glove, front view, open hand reaching forward, thick outlines |

**AI prompt template:**
```
2D cartoon illustration of a [TOOL DESCRIPTION], bright saturated colors,
thick black outline 4px, transparent PNG background, casual mobile game HUD icon style,
3/4 front-facing view, 320x320px
```

### Characters
Transparent PNG. Used in win/lose screens and game overlays.

| Slot key | File | Status | Size | Notes |
|---|---|---|---|---|
| `character_mother_neutral` | `characters/mother-real.png` | ✅ | 762×1350 | Real photo, bg removed |
| `character_mother_kiss` | `characters/mother-kiss.png` | 🔧 | 300×500 | Generated drawing — replace with illustrated |
| `character_mother_scream` | `characters/mother-scream.png` | 🔧 | 300×500 | Generated drawing — replace with illustrated |
| `character_ignacio` | `characters/ignacio.png` | ✅ | 281×380 | Real photo, bg removed |

**Illustrated character prompt template:**
```
2D cartoon character illustration, latin woman [EXPRESSION], waist-up front-facing portrait,
thick black outlines, warm saturated colors, transparent PNG background,
casual mobile game character art style, 600x1000px
```
Expressions needed:
- `mother_kiss` — arms raised, happy closed eyes, puckered lips, floating ❤️ hearts, rosy cheeks
- `mother_scream` — wide shocked eyes, open mouth, hands on cheeks, radial shock lines, sweat drops

---

## How to add an asset from an external system

### Step 1 — Pick the asset and copy the prompt

Open this file, find the slot, copy the **"Description for AI"** or **AI prompt** text.

### Step 2 — Generate in your AI system

| System | Best for |
|---|---|
| **Midjourney v6** | Mess items, furniture, room backgrounds. Use `--style raw --ar 13:10` for mess items. |
| **Adobe Firefly** | Characters, consistent style across expressions. |
| **DALL-E 3** | Quick iterations, good at following exact size descriptions. |
| **Stable Diffusion (local)** | Batch generation of many mess variants. |
| **remove.bg / rembg** | Background removal for real photos. Already set up locally. |

### Step 3 — Name and drop it in `assets/_incoming/`

Use the **slot key** as the filename:
```
mess_juice.png                      → messes/juice.png
room_trinis_room_bg.png             → rooms/trinis-room/background.png
room_kitchen_stove.png              → rooms/kitchen/furniture/stove.png
tool_vacuum.png                     → tools/vacuum.png
character_mother_kiss.png           → characters/mother-kiss.png
```

### Step 4 — Process and validate

```bash
node scripts/process-incoming.mjs    # validates, resizes, moves to correct folder
node scripts/validate-assets.mjs     # shows updated status report
```

### Step 5 — Rebuild and deploy

```bash
npx expo export --platform web --output-dir dist
node scripts/prepare-github-pages.mjs
git add -A && git commit -m "Add production asset: [name]" && git push
```

---

## Priority order (biggest visual impact first)

| Priority | What | Why |
|---|---|---|
| 🔴 1 | `room_trinis_room_bg` | Covers 100% of screen area |
| 🔴 2 | All 9 `mess_*` items | Player looks at these every second |
| 🟡 3 | 3 `tool_*` icons | Visible in HUD throughout gameplay |
| 🟡 4 | `character_mother_kiss` + `scream` | High emotional moment, currently just a drawing |
| 🟢 5 | Room 2: Kitchen background | New level, new environment |
| 🟢 6 | Furniture sprites (layered room upgrade) | Depth and richness |
| 🟢 7 | Room 3: Living room | Third level |
| ⚪ 8 | UI elements | Final polish |

---

## Adding a new room — code checklist

When you have assets for a new room ready:

1. **Add background + furniture** to `assets/rooms/<room-id>/`
2. **Register assets** in `src/game/assets/AssetRegistry.ts` with keys `room_<id>_bg`, `room_<id>_<furniture>`
3. **Create level file** `src/game/levels/level<RoomName>.ts` — copy `levelBedroom.ts` and update:
   - `id`, `title`, `roomAssetKey`
   - `worldWidth`, `worldHeight` (can vary per room)
   - `timeLimitSeconds`
   - `messItems[]` positions (must match new room layout)
4. **Update room drawing** in `scripts/generate-synthetic-assets.mjs` — add a new function to draw the placeholder for that room
5. **Add to level selector** (future screen) — list of levels for player to choose
6. **Update validator** in `scripts/validate-assets.mjs` — add new slots to the manifest

Each room can have different dimensions, timer, and mess count — all controlled from the level file.
