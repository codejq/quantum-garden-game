# Clean Garden Project Context

## What This Is

Clean Garden is an offline 3D garden cleanup game built with plain browser JavaScript, Three.js r128 vendored locally, and Tauri v2 packaging. The current working app lives in `web/` and is packaged for Windows through `src-tauri/`.

The game supports English by default plus Arabic, Spanish, and French. It has single-player and simultaneous two-player modes, keyboard/mouse/touch controls, seeded level attempts, offline assets, generated WebAudio sound, and a browser LLM control hook.

## Important Files

- `web/index.html`: active browser shell and overlays.
- `web/styles/main.css`: active app styling and responsive HUD/touch layout.
- `web/src/main.js`: active browser runtime, rendering, UI binding, score persistence, avatar customization, input, LLM hook, and packaged gameplay.
- `web/src/levels/`: modular level definitions and generated level helpers.
- `web/src/modes/`: modular mode definitions for single-player and race mode.
- `web/src/core/`: headless simulation/session/storage utilities.
- `web/src/input/`: keyboard, touch, mouse, player maps, and LLM agent helpers.
- `web/src/world/`: reusable procedural mesh builders and spawners.
- `src-tauri/tauri.conf.json`: Tauri app config and identifier.
- `docs/modular-offline-tauri-roadmap.md`: original execution roadmap.
- `docs/platform-build-notes.md`: platform build notes and mobile gating.

## Current User-Facing Features

- Fullscreen/viewport-filling game with Exit, Pause, View, and Reset controls.
- Single-player mode.
- Simultaneous two-player mode:
  - Player 1: `WASD + F`.
  - Player 2: arrow keys + `L`.
  - Player 2 is blue.
- Touch support with joystick and plant button.
- Mouse camera drag, wheel zoom, click-to-plant, and shift/right-click move target.
- Camera perspectives with saved view mode.
- Level worlds change by level theme:
  - meadow, pine forest, flower coast, rocky grove, moon garden, then cycling.
- Later levels spawn more ghosts/minions and spawn them faster.
- Score memory:
  - Last score, best score, and total score are saved in `localStorage`.
- Avatar customization:
  - Gender: male/female.
  - Clothes: green, blue, pink, orange.
  - Saved in `localStorage`.

## Persistence Keys

- `cleanGarden.locale`
- `cleanGarden.mode`
- `cleanGarden.quality`
- `cleanGarden.cameraMode`
- `cleanGarden.cameraYaw`
- `cleanGarden.cameraZoom`
- `cleanGarden.best.single.level.{n}`
- `cleanGarden.score.last`
- `cleanGarden.score.best`
- `cleanGarden.score.total`
- `cleanGarden.avatar.gender`
- `cleanGarden.avatar.clothes`

## Build And Test Commands

- Run tests: `npm test`
- Build web bundle: `npm run build`
- Build Windows desktop app: `npm run tauri:build`
- Windows EXE output: `src-tauri/target/release/clean-garden.exe`
- Windows installers:
  - `src-tauri/target/release/bundle/msi/`
  - `src-tauri/target/release/bundle/nsis/`

## Android And iOS Notes

- Current Android namespace/package id: `com.quantumbilling.cleangarding`.
- Android project is scaffolded under `src-tauri/gen/android`.
- Android output metadata has been observed with `applicationId: com.quantumbilling.cleangarding`.
- macOS and iOS remain gated on Mac hardware, Xcode, signing certificates, and Apple Developer access.

## LLM Play Interface

The browser exposes `window.QuantumGardenAgent` during gameplay.

Useful actions include:

- `observe()`
- `reset({ mode, levelId, seed })`
- `act({ type: 'move', x, z })`
- `act({ type: 'plantNearest' })`
- `act({ type: 'moveToNearestTrash' })`
- `act({ type: 'moveToNearestPatch' })`
- `act({ type: 'chaseNearestVillain' })`
- `act({ type: 'attackBoss' })`
- `act({ type: 'setCamera', mode })`

The hook is intended for model evaluation and demos without direct DOM/WebGL control.

## Working Conventions

- Use `rg` for search.
- Use `apply_patch` for manual file edits.
- Do not revert unrelated user changes.
- There is often an untracked `.gitignore`; leave it alone unless explicitly asked.
- Run `npm test` before committing behavior changes.
- Rebuild with `npm run tauri:build` when the user expects the Windows app/exe to include the latest change.

## Recent Direction

The user is actively refining the packaged game. Recent requests focused on:

- Windows EXE behavior.
- HUD overlap fixes.
- Touch and mouse support.
- Simultaneous two-player mode.
- Player 2 blue color.
- Two-player planting keys changed to `F` and `L`.
- Camera-relative movement after perspective changes.
- Android namespace update.
- More ghosts/minions and different world design per level.
- Score memory and avatar customization.
