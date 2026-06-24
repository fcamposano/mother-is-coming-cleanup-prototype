# Asset Pipeline — Trini's Room Cleanup Game

Run `node scripts/validate-assets.mjs` at any time to see which assets are placeholders vs production-ready.

To add a new asset: drop the file in `assets/_incoming/` named exactly as the slot (e.g. `mess_juice.png`), then run `node scripts/process-incoming.mjs`.

---

## Style Guide — ALL assets must follow this

| Property | Value |
|---|---|
| **Art style** | 2D cartoon, top-down view (camera looks straight down). Think "board game pieces seen from above." |
| **Outline** | Thick black outline, 3–5px equivalent. Every element has a clear edge. |
| **Colors** | Saturated, warm palette. No photorealistic textures. Flat fills with 1–2 highlight spots. |
| **Lighting** | Implied top-left soft light. No hard shadows. Mild drop shadow under objects (semi-transparent black offset 4px down-right). |
| **Background** | **Transparent PNG for all mess, character, tool, and furniture assets.** |
| **Room background** | Solid colors + simple shapes — NO transparent background. |
| **File format** | PNG, 32-bit RGBA (except room background which can be RGB). |
| **Compression** | Optimize with pngquant or similar. Target < 150 KB per asset. |

### Color palette (reference)
- Floor: `#e8d8b8` warm wood
- Walls: `#f0e8d8`
- Bed left: `#b8a4d8` (lavender)
- Bed right: `#e8a4b4` (rose)
- Rug: `#c43050` (deep red)
- Accent: `#ffd53d` yellow, `#00c8b0` teal, `#ff3355` red

---

## Asset Registry

Status legend: ✅ production-ready | 🔧 placeholder (procedurally generated) | ❌ missing

---

### MESS ITEMS  
Each mess is a top-down view of the mess on the floor. No person visible. Transparent background.  
**Canvas size: 440×340 px (2× for retina rendering at 220×170 game units)**  
**View: straight down, slight perspective tilt okay**

| Slot key | File | Status | Tool needed | Description for AI |
|---|---|---|---|---|
| `mess_crumbs` | `messes/crumbs.png` | 🔧 | vacuum | Scattered breadcrumbs and cookie bits on floor, top-down, warm brown tones |
| `mess_dust` | `messes/dust.png` | 🔧 | vacuum | Fluffy dust bunny cluster, grey-beige, with tiny debris specks |
| `mess_debris` | `messes/debris.png` | 🔧 | vacuum | Mixed dry debris: paper scraps, small bits, popcorn kernel, top-down |
| `mess_juice` | `messes/juice.png` | 🔧 | mop | Spilled juice puddle, reddish-pink, irregular blob shape, wet sheen highlight |
| `mess_mud` | `messes/mud.png` | 🔧 | mop | Muddy footprints track, 2–3 shoe prints, dark brown, slightly wet look |
| `mess_sticky` | `messes/sticky.png` | 🔧 | mop | Honey/caramel sticky spill, golden amber, glossy highlight, drip edges |
| `mess_clothes` | `messes/clothes.png` | 🔧 | hand | Pile of clothes top-down: t-shirt, shorts, sock visible, colorful |
| `mess_toys` | `messes/toys.png` | 🔧 | hand | Scattered toys: building blocks, small car, ball, top-down view |
| `mess_trash` | `messes/trash.png` | 🔧 | hand | Trash pile: crumpled paper, candy wrapper, empty bottle cap |

**AI prompt template for mess items:**
```
Top-down 2D cartoon illustration of [DESCRIPTION], transparent background, 
thick black outline 4px, warm saturated colors, flat shading with one bright 
highlight spot, slight drop shadow, game asset style, no person, clean edges, 
440x340px PNG
```

---

### SURPRISE MESS ITEMS (Ignacio drops these)

| Slot key | File | Status | Tool needed | Description for AI |
|---|---|---|---|---|
| `mess_ignacio_goop` | `messes/ignacio-goop.png` | ❌ missing | mop | Slime/goo splat, green-yellow, bubbly texture, top-down splash shape |
| `mess_ignacio_clothes` | `messes/ignacio-clothes.png` | ❌ missing | hand | Boy's clothes pile: Jeep t-shirt, dark shorts, one sock, top-down |

---

### ROOM BACKGROUND
Full room painted in one image. Top-down view of the whole bedroom.  
**Canvas size: 980×1480 px (device pixel ratio 1)**

| Slot key | File | Status | Description for AI |
|---|---|---|---|
| `room_bedroom` | `rooms/bedroom-cartoon.png` | 🔧 | Top-down cartoon bedroom: two parallel beds (left=lavender, right=rose), small desk between them, red rug center floor, window top-right with curtains, door bottom-center, dresser left with birdcage on top. Warm wood floor, cream walls. No characters. No mess items. Clean room only. |

**AI prompt for room:**
```
Top-down 2D cartoon illustration of a kids bedroom viewed from directly above, 
980x1480px, two single beds placed parallel (left bed lavender purple headboard, 
right bed rose pink headboard), small wooden desk centered between them at top, 
large deep red oval rug in center floor, wooden dresser on left wall with 
birdcage on top containing two parakeets (one blue, one grey), window with 
white curtains upper right, wooden door bottom center, warm oak wood floor planks, 
cream walls, thick black outlines, cartoon game asset style, no characters, RGB PNG
```

---

### ROOM FURNITURE (individual assets for layered approach — future)
Each furniture piece as standalone PNG. Top-down view. Transparent background.  
**To be used when room switches from single-image to layered sprites.**

| Slot key | File | Status | Size | Description for AI |
|---|---|---|---|---|
| `furniture_bed_left` | `rooms/furniture/bed-left.png` | ❌ | 420×320 px | Single bed top-down, lavender headboard, white pillow, wrinkled duvet, wooden frame |
| `furniture_bed_right` | `rooms/furniture/bed-right.png` | ❌ | 420×320 px | Single bed top-down, rose pink headboard, white pillow, light pink duvet |
| `furniture_desk` | `rooms/furniture/desk.png` | ❌ | 140×230 px | Small wooden desk top-down, light wood, nothing on surface |
| `furniture_dresser` | `rooms/furniture/dresser.png` | ❌ | 280×220 px | Wooden dresser top-down, 3 drawers visible, warm oak |
| `furniture_birdcage` | `rooms/furniture/birdcage.png` | ❌ | 180×220 px | Round birdcage top-down, metal bars, two parakeets inside (one blue, one grey), small perch |
| `furniture_rug` | `rooms/furniture/rug.png` | ❌ | 740×480 px | Oval rug top-down, deep red `#c43050`, simple border pattern |
| `furniture_window` | `rooms/furniture/window.png` | ❌ | 220×200 px | Window top-down inset, white frame, light blue glass, white curtains on sides |
| `furniture_door` | `rooms/furniture/door.png` | ❌ | 180×300 px | Wooden door top-down, brown, round door knob, slight shadow |

---

### CHARACTERS
Top-down camera means characters appear slightly foreshortened. Head visible from above/front angle. Transparent background.

| Slot key | File | Status | Size | Notes |
|---|---|---|---|---|
| `character_mother_neutral` | `characters/mother-real.png` | ✅ | 762×1350 px | Real photo, background removed. Currently used for win+lose. |
| `character_mother_kiss` | `characters/mother-kiss.png` | 🔧 | 260×360 px | Procedurally generated drawing. Replace with illustrated version. |
| `character_mother_scream` | `characters/mother-scream.png` | 🔧 | 260×360 px | Procedurally generated drawing. Replace with illustrated version. |
| `character_ignacio` | `characters/ignacio.png` | ✅ | 281×380 px | Real photo, background removed. |

**Illustrated character spec (for replacing generated drawings):**
```
2D cartoon illustration of a latin woman [EXPRESSION: big smile throwing kisses / 
wide open mouth screaming in shock], front-facing portrait from waist up, 
thick black outlines, warm saturated colors, transparent background, 
game character art style similar to mobile casual games, 300x500px PNG
```

**Expression variants needed:**
- `mother_kiss` — arms up, eyes closed happy, puckered lips, floating ❤️ hearts around
- `mother_scream` — wide eyes, open mouth, hands on cheeks, shock lines radiating, sweat drops

---

### TOOLS (HUD icons)
Viewed from slight front-angle (not top-down). Used as UI buttons.  
**Canvas size: 320×320 px (renders at 80×80 in HUD)**

| Slot key | File | Status | Description for AI |
|---|---|---|---|
| `tool_vacuum` | `tools/vacuum.png` | 🔧 | Cartoon handheld vacuum cleaner, blue, front-angle 3/4 view, thick outlines, transparent bg |
| `tool_mop` | `tools/mop.png` | 🔧 | Cartoon mop with blue bucket, front-angle, white mop head, wooden handle, thick outlines |
| `tool_hand` | `tools/hand.png` | 🔧 | Cartoon gloved hand reaching/grabbing, yellow rubber glove, front-angle, thick outlines |

**AI prompt template for tools:**
```
2D cartoon illustration of a [TOOL], bright colors, thick black outline 4px, 
transparent background, casual mobile game asset style, 3/4 front view, 
clean simple design, 320x320px PNG
```

---

### UI ELEMENTS (future)

| Slot key | File | Status | Size | Description |
|---|---|---|---|---|
| `ui_speech_bubble` | `ui/speech-bubble.png` | ❌ | flexible | White speech bubble with black outline, tail pointing left, no text |
| `ui_star_full` | `ui/star-full.png` | ❌ | 120×120 px | Filled gold star, cartoon, thick outline |
| `ui_star_empty` | `ui/star-empty.png` | ❌ | 120×120 px | Empty star outline |
| `ui_button_green` | `ui/button-green.png` | ❌ | 480×140 px | Rounded rectangle button, green, thick outline, 9-slice compatible |
| `ui_button_red` | `ui/button-red.png` | ❌ | 480×140 px | Same, red |
| `ui_timer_bar_bg` | `ui/timer-bar-bg.png` | ❌ | 700×60 px | Timer bar background track, dark, rounded ends |
| `ui_timer_bar_fill` | `ui/timer-bar-fill.png` | ❌ | 700×60 px | Timer fill, gradient teal→yellow→red, no text |

---

## How to add an asset from an external system

### Step 1 — Generate the asset

Use this prompt in your AI system (Midjourney, DALL-E, Adobe Firefly, etc.):
1. Find the asset row above and copy the **"Description for AI"** text
2. Prepend the style guide requirements: style, outline, transparent bg, size
3. Generate, download as PNG

### Step 2 — Drop it in `assets/_incoming/`

Name the file exactly as the `Slot key` with `.png` extension.  
Example: `mess_juice.png`, `tool_vacuum.png`, `furniture_bed_left.png`

### Step 3 — Run the processor

```bash
node scripts/process-incoming.mjs
```

This will:
- Validate format (PNG, RGBA, correct size ±20%)
- Auto-resize if slightly off (uses Lanczos)
- Move to correct subfolder
- Report what was processed

### Step 4 — Validate all assets

```bash
node scripts/validate-assets.mjs
```

Shows a table of all slots: which are placeholder vs real, file size, dimensions.

### Step 5 — Rebuild

```bash
npx expo export --platform web --output-dir dist
node scripts/prepare-github-pages.mjs
git add -A && git commit -m "Add production asset: [name]" && git push
```

---

## Asset priority order (what to replace first for biggest visual impact)

1. 🔴 **Room background** — biggest surface area, most visible
2. 🔴 **Mess items** — player interacts with these constantly (9 types)
3. 🟡 **Tools** — seen in HUD every second of gameplay
4. 🟡 **Mother scream/kiss** — shown at game end, high emotional moment
5. 🟢 **Furniture sprites** — when ready to switch to layered room
6. 🟢 **UI elements** — polish pass last

---

## Recommended external systems

| Use case | System | Notes |
|---|---|---|
| Illustrated assets (mess, furniture, tools) | **Midjourney v6** | Best for cartoon game art. Use `--style raw` + `--ar` flag for exact ratios. |
| Character illustrations | **Adobe Firefly** | Good for consistent character style across expressions. |
| Photo background removal | **remove.bg** or `rembg` (local Python) | Already integrated for Ignacio + Mother photos. |
| Photo enhancement | **Topaz Photo AI** | Upscaling + noise reduction for real photos. |
| UI elements | **Figma + FigJam AI** | Vector → export as PNG at 2× |
| Sprite sheet → individual | `scripts/process-incoming.mjs` | Handles splitting if you provide a sheet |
