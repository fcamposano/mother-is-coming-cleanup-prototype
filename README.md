# Mother Is Coming - Cleaning Game Prototype

An iPhone-first Expo/React Native vertical slice for a funny 2D room-cleaning game. The prototype tests the core loop: pan around a room larger than the screen, select a tool, clean the right messes, and survive inspection when mom arrives.

## What Exists Now

- A data-driven bedroom level in `src/game/levels/levelBedroom.ts`.
- A pannable 980x1480 room with generated placeholder room and sprite assets.
- Three tools: Vacuum, Mop, and Hand.
- Nine mess items split across dry dirt, wet spills, and pickup clutter.
- Drag/rub cleaning with correct-tool progress and wrong-tool feedback.
- Countdown timer, win state, inspection state, loss state, and retryable result screen.
- Mother/inspector placeholder during inspection.
- Red flags on missed messes during inspection/loss.
- Debug overlay with phase, camera, viewport, world size, timer, selected tool, remaining count, and missed ids.

## Install Dependencies

```bash
cd "/Users/fcamposa/Documents/New project/apps/cleanup-game"
npm install
```

## Run On iPhone With Expo

1. Install Expo Go on the iPhone.
2. Start the dev server:

```bash
cd "/Users/fcamposa/Documents/New project/apps/cleanup-game"
npm start
```

3. Scan the QR code with the iPhone camera or Expo Go.

Use the same Wi-Fi network for the computer and phone. If the phone cannot connect, press `s` in the Expo terminal to switch connection modes.

## Run On iOS Simulator

```bash
cd "/Users/fcamposa/Documents/New project/apps/cleanup-game"
npm run ios
```

This requires Xcode and an installed iOS simulator.

## Deploy To GitHub Pages

The repo includes a GitHub Actions workflow at `.github/workflows/deploy-cleanup-game-pages.yml`.

To publish:

1. Push this repository to GitHub.
2. In GitHub, open the repository settings.
3. Go to `Pages`.
4. Set `Build and deployment` to `GitHub Actions`.
5. Push to `master`/`main`, or run the `Deploy Cleanup Game To GitHub Pages` workflow manually.

The workflow runs:

```bash
cd "apps/cleanup-game"
npm ci
npm run typecheck
npm run build:pages
```

`build:pages` exports the Expo web build and patches bundle paths so the app works from a GitHub Pages project URL such as `https://username.github.io/repo-name/`.

## How To Play

- Drag on empty floor to pan around the larger room.
- Select Vacuum, Mop, or Hand from the bottom toolbar.
- Drag over a mess with the correct tool to clean it.
- Wrong tools flash a warning and do not clean.
- Clean everything before the timer ends to win.
- If time expires, mom appears, missed messes get red flags, and the result screen appears.
- Tap `DBG` to show camera position, selected tool, remaining mess count, hitboxes, and item ids.

## Local Verification

Useful commands:

```bash
npm run typecheck
npm run build:web
npm start
```

Current verified status:

- `npm run typecheck` passes.
- `npm run build:web` passes and exports the Expo web build to `dist/`.

## Files Changed In The Latest Pass

- `src/game/components/GameCanvas.tsx`: fixed image mess debug/wrong-tool style ordering and made the inspector screen-fixed during inspection/loss.
- `src/game/components/DebugOverlay.tsx`: expanded debug data for camera, viewport, world, phase, timer, and missed ids.
- `src/game/components/ResultModal.tsx`: added missed mess names to the loss result.
- `src/game/state/gameStore.ts`: clamps camera when viewport size changes.
- `src/game/systems/AudioSystem.ts`: prevents overlapping panic music loads from repeated touch events.
- `src/screens/GameScreen.tsx`: wires richer debug/result data into the UI.
- `README.md`: updated run instructions, current state, limitations, and next milestones.

## Add A New Mess Item

Edit [src/game/levels/levelBedroom.ts](src/game/levels/levelBedroom.ts) and add another object to `messItems`.

Required fields:

```ts
{
  id: "unique-id",
  label: "Visible Label",
  messType: "dry_dirt",
  requiredTool: "vacuum",
  x: 120,
  y: 420,
  width: 140,
  height: 90,
  assetKey: "mess_crumbs",
  cleanProgressRequired: 100,
  scoreValue: 100
}
```

Use debug mode to tune `x`, `y`, `width`, and `height`.

## Add A New Level

1. Create a new file in `src/game/levels/`, following the `LevelDefinition` shape in [src/game/types/gameTypes.ts](src/game/types/gameTypes.ts).
2. Point the store at the new level in [src/game/state/gameStore.ts](src/game/state/gameStore.ts).
3. Reuse existing systems and components; room content should live in the level config, not rendering logic.

## Replace Character Images

Character placeholders are configured in [src/game/assets/AssetRegistry.ts](src/game/assets/AssetRegistry.ts).

For real photos or transparent PNG cutouts:

1. Add the image file under a future `assets/characters/` folder.
2. Add an `image: require("...")` entry to the character asset.
3. Update the renderer to prefer `asset.image` over the placeholder block.

Only use real-person photos/cutouts with consent and distribution permission.

## Replace Tool Images

Tool placeholders are also in `AssetRegistry.ts` under `tool_vacuum`, `tool_mop`, and `tool_hand`. Add image modules to those entries, then update `ToolSelector` to render the image when present.

## Replace Sounds

Sound event names are routed through [src/game/systems/AudioSystem.ts](src/game/systems/AudioSystem.ts).

Next steps:

1. Add sound files to the asset registry.
2. Preload them through Expo Audio or Expo AV.
3. Map stable game events like `clean`, `wrongTool`, `motherArrival`, `scream`, and `victory` to concrete files.

## Current Limitations

- Visuals and audio are generated placeholders, not final production art or sound design.
- Cleaning progress is simple drag distance over hitboxes.
- There are no particles, cleaning masks, or tool-specific animation polish yet.
- The inspection animation is intentionally minimal and the result modal appears after a short fixed delay.
- No level select, persistence, accessibility pass, or device performance tuning yet.
- The app is tuned for portrait phone play first; tablet and landscape layout need a dedicated pass.
- npm audit reports upstream dependency advisories from the Expo dependency tree; do not run breaking upgrades without checking Expo SDK compatibility.

## Recommended Next Milestones

1. Add a second room level to prove the data-driven level architecture.
2. Replace generated placeholder art with final room, mess, tool, and mother assets.
3. Improve game feel with tool-specific particles, sounds, rub trails, and cleaning masks.
4. Add a camera minimap or off-screen mess hints.
5. Add a short intro countdown and clearer final inspection choreography.
6. Add persistence, level select, accessibility labels, and device performance tuning.
