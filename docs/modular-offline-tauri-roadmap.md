# Quantum Garden Game Modular Offline Tauri Roadmap

## Current State

- [x] Review [web/index.html](../web/index.html) before implementation work starts.
- [x] Confirm the current prototype is a single HTML file with inline CSS, inline JavaScript, Arabic-first UI, CDN-loaded Three.js, CDN-loaded Google font, keyboard controls, touch joystick, level completion overlay, generated 3D assets, sound synthesis, and randomized trash/tree/villain placement.
- [x] Preserve the current strengths during refactor: smooth camera/player motion, lightweight procedural art, generated WebAudio sound, and low asset weight.
- [x] Confirm current simulation and rendering are tightly coupled: entity state is stored on Three.js meshes and the game advances only inside `requestAnimationFrame`.
- [x] Confirm current randomization uses `Math.random()` across gameplay, cosmetics, and mesh builders, which prevents deterministic replay.
- [x] Confirm the current game assumes one persistent scene across a continuous session.
- [x] Treat the current game as the behavior baseline until tests and screenshots prove otherwise.
- [x] Change teh name of teh game to be Clean Garden both in arabic and in eglish .
- [x] The game should be smooth as the original one as it now not so smoth and the movement is degrdeded .
- [x] The button on the header of teh game are overlabed with other buttons we need to fix that

## Goals

- [x] Protect the current working prototype before large refactors begin.
- [x] Split the single HTML file into standard HTML, CSS, and JavaScript modules.
- [ ] Separate simulation from rendering so gameplay state is plain data and Three.js only visualizes that state.
- [x] Add a fixed-timestep simulation loop so tests, replay, two-player race, and LLM play are deterministic.
- [x] Support `en`, `ar`, `es`, and `fr`.
- [x] Make English the default language.
- [x] Preserve Arabic RTL support.
- [x] Make game modes and levels modular so more modes and levels can be added without editing the core loop.
- [x] Add a Tauri project so the game can be packaged for Windows, macOS, Linux, Android, and iOS.
- [x] Make the game work fully offline.
- [x] Make the game full screen during play and provide an in-game exit button.
- [x] Support mobile touch and desktop keyboard/mouse input.
- [x] Add single-player mode.
- [x] Add two-player race mode where players compete for fastest completion time.
- [x] Randomize level start conditions and scene layout each time a level is played.
- [x] Add an LLM-playable interface so an external model can observe game state and send actions.

## Task Zero: Baseline Protection

- [x] Initialize git before changing gameplay code.
- [x] Commit the current working prototype as the baseline.
- [x] Create a branch per phase or per milestone.
- [x] Copy the current `web/index.html` to `web/legacy/index.html` as a frozen reference build.
- [x] Add a short note in `web/legacy/README.md` explaining that the legacy build is for parity checks only.
- [x] Add a simple parity snapshot script that records key baseline behavior from the legacy build.
- [x] Capture baseline screenshots for desktop and mobile viewport sizes.
- [x] Capture a short baseline gameplay checklist: start game, collect trash, plant tree, convert minion, defeat boss, finish level.
- [x] Do not edit `web/legacy/index.html` except when intentionally updating the frozen reference after a signed-off milestone.
- [x] Task zero exit gate: git exists, baseline commit exists, frozen legacy reference exists, and baseline screenshots/checklist are saved.

## MVP Line

- [x] Define v0.1 MVP as a playable offline web game with modular code, self-contained levels, seeded/randomized level attempts, English default, Arabic support, full-screen play, exit/pause, keyboard/touch controls, and single-player mode.
- [x] Treat Phases 1, 2, 3, 4, 5, and 6 as the v0.1 MVP path.
- [x] Treat mouse camera polish, view presets, two-player race, LLM play, Tauri desktop, Android, iOS, and macOS as post-MVP expansion unless a release decision changes priority.
- [x] v0.1 exit gate: game builds locally, runs offline in browser, supports English and Arabic, can start and finish a single-player level, supports desktop and mobile input, and can safely exit or pause.

## Architecture Decisions

- [x] Make each level attempt self-contained: build from seed, play, complete or exit, tear down, dispose, and rebuild.
- [ ] Make simulation data the source of truth.
- [ ] Store player, trash, patches, villains, boss, objectives, timers, score, and level seed as plain JavaScript data.
- [x] Do not store authoritative gameplay state only on Three.js meshes.
- [x] Make rendering read simulation state and sync mesh transforms each frame.
- [x] Add a fixed simulation tick such as `1/60` or `1/30` seconds.
- [x] Use an accumulator in the visual loop so rendering can run at any frame rate while simulation advances deterministically.
- [x] Allow tests and LLM agents to call `step()` without creating a WebGL renderer.
- [x] Use a seeded random generator for all gameplay and cosmetic generation.
- [x] Use fully seeded world generation for reproducible LLM evaluation and bug reports.
- [x] Add stable object IDs for all interactive objects.
- [x] Add teardown/disposal rules for every scene object created during a level attempt.
- [x] Vendor current Three.js r128 locally first to remove CDN usage without changing behavior.
- [x] Treat upgrading Three.js as a separate future migration after the modular/offline baseline is stable.
- [x] Make two-player race v1 a sequential same-seed time trial.
- [x] Gate iOS and macOS release work behind access to macOS, Xcode, signing certificates, and Apple Developer account.

## Prototype Cleanup And Known Issues

- [x] Fix cumulative world state across levels.
- [x] Move decorative world generation into the level-attempt lifecycle instead of running it only once at module load.
- [x] Clear old planted patches and planted trees when starting a new level attempt unless a future mode explicitly needs persistent progression.
- [x] Reset per-level patch counts so the mission card does not show trees from previous levels.
- [x] Decide whether `Game.trees` is lifetime total, per-level total, or both.
- [x] If lifetime and per-level tree counts are both needed, track them as separate fields.
- [x] Add a level-attempt cleanup function that removes all gameplay objects.
- [x] Add a world cleanup function that removes all decorative objects created for the attempt.
- [x] Dispose geometries, materials, and textures for removed objects.
- [x] Review the shared material cache and define which materials are global and which are attempt-scoped.
- [x] Avoid silent trash spawn failure when the trash cap is reached.
- [x] Replace `spawnTrash()` no-op behavior with an explicit result such as `{ spawned: true }` or `{ spawned: false, reason: "cap" }`.
- [x] Make villain litter behavior react to failed trash spawns instead of pretending trash was dropped.
- [x] Replace bare boss `setTimeout()` scheduling with simulation-owned timers.
- [x] Store and clear any remaining browser timer handles during pause, retry, exit, or level transition.
- [x] Ensure pause freezes gameplay timers, boss spawn timing, villain drops, elapsed time, and input effects.
- [x] Ensure visual-only animations can continue during pause only if intentionally allowed.
- [x] Recalculate or redesign pollution denominator so spawned trash during a level does not make the meter misleading.
- [x] Remove `maximum-scale=1.0` and `user-scalable=no` unless a platform-specific reason requires them.
- [x] Add accessible labels for emoji-only buttons.
- [x] Replace global singleton assumptions with instantiable game/session objects.
- [x] Support creating a fresh `GameSession({ mode, levelId, seed })` for tests, LLM evaluation, retries, and races.

## Target Project Structure

- [x] Create `web/index.html` as the minimal document shell.
- [x] Create `web/styles/main.css` for global layout, HUD, overlays, controls, and responsive behavior.
- [x] Create `web/src/main.js` as the browser entry point.
- [x] Create `web/src/core/game.js` for game lifecycle, state transitions, scoring, win checks, and pause/resume.
- [x] Create `web/src/core/session.js` for instantiable `GameSession` creation, reset, retry, and teardown.
- [x] Create `web/src/core/simulation.js` for the renderer-independent fixed-timestep simulation.
- [x] Create `web/src/core/loop.js` for the render/update loop.
- [x] Create `web/src/core/events.js` for a small internal event bus.
- [x] Create `web/src/core/random.js` for seeded random generation.
- [x] Create `web/src/core/storage.js` for local save data, settings, and best times.
- [x] Add a storage schema version field to all persisted settings, progress, best times, language, and camera preferences.
- [x] Add storage migration helpers so future save-data changes do not corrupt old saves.
- [x] Create `web/src/core/disposal.js` for Three.js geometry, material, texture, and object cleanup.
- [x] Create `web/src/render/scene.js` for Three.js scene, renderer, camera, lights, fog, and resize handling.
- [x] Create `web/src/render/sync.js` for mapping simulation entities to Three.js meshes.
- [x] Create `web/src/render/materials.js` for shared material creation and disposal helpers.
- [x] Create `web/src/world/builders.js` for trees, flowers, rocks, trash, player, villains, and other mesh builders.
- [x] Create `web/src/world/spawners.js` for level object placement.
- [x] Create `web/src/entities/player.js` for player entity state and animation.
- [x] Create `web/src/entities/villain.js` for minion and boss behavior.
- [x] Create `web/src/entities/trash.js` for trash behavior.
- [x] Create `web/src/entities/patch.js` for planting patch behavior.
- [x] Create `web/src/input/keyboard.js` for desktop movement and actions.
- [x] Create `web/src/input/mouse.js` for desktop mouse movement, camera control, pointer selection, and click actions.
- [x] Create `web/src/input/touch.js` for mobile joystick and action button.
- [x] Create `web/src/input/llm-agent.js` for model-controlled actions.
- [x] Create `web/src/camera/camera-controller.js` for follow camera, orbit camera, zoom, and perspective changes.
- [x] Create `web/src/ui/hud.js` for score, mission, meter, prompt, and notifications.
- [x] Create `web/src/ui/overlays.js` for start, level-complete, pause, mode select, language select, and exit screens.
- [x] Create `web/src/i18n/index.js` for translation loading, locale selection, interpolation, and document direction.
- [x] Create `web/src/i18n/locales/en.json`.
- [x] Create `web/src/i18n/locales/ar.json`.
- [x] Create `web/src/i18n/locales/es.json`.
- [x] Create `web/src/i18n/locales/fr.json`.
- [x] Create `web/src/modes/single-player.js`.
- [x] Create `web/src/modes/two-player-race.js`.
- [x] Create `web/src/levels/level-registry.js`.
- [x] Create `web/src/levels/level-001.js` as the first migrated level definition.
- [x] Create `web/src/levels/templates.js` for reusable objective templates.
- [x] Create `web/src/levels/solvability.js` for spawn validation, reachability checks, and layout rejection.
- [x] Create `web/assets/fonts/` for offline fonts.
- [x] Create `web/assets/vendor/` for offline third-party browser libraries.
- [x] Create `web/assets/audio/` only if generated synth audio is replaced by fixed assets.

## Build Tooling

- [x] Add `package.json` for web build scripts and dependency management.
- [x] Add Vite or an equivalent lightweight bundler.
- [x] Vendor the current Three.js r128 build locally first instead of loading it from a CDN.
- [x] Keep the visual baseline stable while removing CDN dependencies.
- [x] Add a separate later task to migrate from Three.js r128 to a modern npm Three.js release.
- [x] Remove the Google Fonts network dependency.
- [x] Self-host the current `Baloo Bhaijaan 2` font because it supports Arabic and Latin text for the required locales.
- [x] Add local font files under `web/assets/fonts/`.
- [x] Add CSS `@font-face` rules for offline fonts.
- [x] Add `npm run dev` for browser development.
- [x] Add `npm run build` to produce a static offline build.
- [x] Add `npm run preview` to test the built output.
- [x] Add `npm run lint` if lint tooling is introduced.
- [x] Add `npm run test` once tests exist.

## HTML, CSS, JavaScript Separation

- [x] Move all `<style>` content from `web/index.html` into `web/styles/main.css`.
- [x] Move all inline `<script>` game logic into JavaScript modules under `web/src/`.
- [x] Keep `web/index.html` focused on root containers, metadata, and script/style references.
- [x] Replace hard-coded Arabic text in HTML with UI rendering from the i18n system.
- [x] Ensure `document.documentElement.lang` updates when the selected locale changes.
- [x] Ensure `document.documentElement.dir` is `rtl` for Arabic and `ltr` for English, Spanish, and French.
- [x] Replace direction-specific CSS such as `text-align:right`, `left`, `right`, and directional margins with logical CSS such as `text-align:start`, `inset-inline`, `margin-inline`, and `padding-inline`.
- [x] Preserve the current touch controls and keyboard controls after the split.
- [ ] Preserve the current visual behavior after the split.

## Simulation And Rendering Separation

- [ ] Replace module-global gameplay singletons with session-owned state.
- [x] Move player position, velocity, yaw, animation time, and input state into plain simulation data.
- [x] Move trash positions, IDs, collected state, and scoring values into plain simulation data.
- [x] Move patch positions, IDs, planted state, tree growth state, and interaction radius into plain simulation data.
- [x] Move villain positions, IDs, HP, target, behavior state, timers, and boss/minion type into plain simulation data.
- [x] Move objective progress and win checks into the simulation layer.
- [ ] Keep Three.js mesh objects inside the render layer only.
- [x] Add a render sync layer that creates, updates, and removes meshes to match simulation entities.
- [x] Add fixed-timestep simulation stepping.
- [x] Add headless simulation tests that run without DOM, canvas, or WebGL.
- [x] Ensure `Game.running`, pause, and level completion are simulation states, not only UI flags.
- [x] Keep environment animation that is purely visual in the render layer.
- [x] Keep gameplay-affecting timers in the simulation layer.
- [x] Add object lifecycle hooks for spawn, update, complete, remove, and dispose.
- [x] Add level-attempt lifecycle hooks: `buildAttempt(seed)`, `startAttempt()`, `pauseAttempt()`, `completeAttempt()`, `exitAttempt()`, and `teardownAttempt()`.
- [ ] Verify the browser game still behaves like the original prototype after the separation.

## Localization

- [x] Define translation keys for every visible UI string.
- [x] Add English translations as the default source.
- [x] Add Arabic translations.
- [x] Add Spanish translations.
- [x] Add French translations.
- [x] Add localized mission text.
- [x] Add localized tutorial text.
- [x] Add localized buttons.
- [x] Add localized level-complete messages.
- [x] Add localized gameplay notification lines.
- [x] Add localized accessibility labels.
- [x] Add a language selector on the start/pause/settings screen.
- [x] Save the selected language locally for offline reuse.
- [x] Fall back to English for missing keys.
- [x] Verify Arabic layout does not overlap in RTL.
- [x] Verify English, Spanish, and French text fits in buttons, HUD chips, and overlays.

## Modular Game Modes

- [x] Define a `GameMode` interface with `id`, `nameKey`, `setup()`, `start()`, `update()`, `onObjectiveEvent()`, `isComplete()`, and `getResults()`.
- [x] Move current gameplay into `single-player` mode.
- [x] Add a mode registry that lists available modes.
- [x] Add a mode select screen before starting the game.
- [x] Keep mode state separate from rendering state.
- [x] Keep scoring rules inside each mode.
- [x] Make the HUD read mode-provided objectives instead of hard-coded mission rows.
- [x] Add clear extension docs for adding a new mode.

## Level System

- [x] Define a `LevelDefinition` object shape with `id`, `nameKey`, `difficulty`, `world`, `objectives`, `spawnRules`, `timer`, `boss`, and `randomization`.
- [x] Move the current level formula into level definitions.
- [x] Create a level registry.
- [x] Support finite authored levels.
- [x] Support generated levels after authored levels are complete.
- [x] Add seeded random generation per level attempt.
- [x] Store the active seed in game state.
- [x] Show or log the seed for debugging.
- [x] Replace all `Math.random()` calls with seeded random helpers.
- [x] Route mesh builder variation such as tree type, bark color, petal count, petal color, trash type, and cloud placement through seeded random helpers.
- [x] Rebuild the full gameplay and decorative scene for each level attempt.
- [x] Do not let authored or generated level attempts inherit stale objects from previous attempts.
- [x] Randomize trash placement each attempt.
- [x] Randomize planting patch placement each attempt.
- [x] Randomize decorative flowers, rocks, trees, clouds, and scene details each attempt.
- [x] Randomize villain spawn timing within level-defined limits.
- [x] Randomize player starting position within valid spawn zones.
- [x] Prevent random placement from blocking objectives.
- [x] Add post-placement solvability checks before accepting a generated layout.
- [x] Verify the player can reach all required trash, planting patches, villains, and boss interaction zones.
- [x] Reject and regenerate layouts that fail reachability or objective constraints.
- [x] Limit regeneration attempts and report a clear layout-generation error if no valid seed/layout can be found.
- [x] Add deterministic replay support by reusing a saved seed.
- [x] Add seeded layout snapshots for debugging failed tests or bug reports.
- [x] Add explicit cleanup before loading a new level attempt.
- [x] Dispose removed Three.js geometries, materials, textures, and generated objects to avoid GPU memory leaks.

## Single Player Mode

- [x] Preserve current single-player objective set: collect trash, plant trees, convert minions, defeat boss.
- [x] Add elapsed-time tracking.
- [x] Add best-time tracking per level and seed type.
- [x] Add pause/resume.
- [x] Add retry level.
- [x] Add return-to-menu.
- [x] Add level-complete summary with score, trees, trash, time, and best time.

## Two Player Race Mode

- [x] Implement the first version as local sequential same-seed time trial.
- [x] For sequential race, let Player 1 complete the level, then Player 2 plays the same level seed.
- [x] Add a handoff screen between players so Player 2 does not watch Player 1's route on the same seed.
- [x] Add a ready button before Player 2 starts.
- [x] Compare completion times.
- [x] Show winner and time difference.
- [x] Save both player results locally until the race summary is dismissed.
- [x] Add optional player names.
- [x] For future real-time race, define separate input maps for Player 1 and Player 2.
- [x] For future real-time race, support separate entities, independent collision checks, and shared objective ownership.
- [x] Treat real-time split-screen or same-arena competition as a later mode after the simulation/render split is stable.

## Full Screen And Exit

- [x] Add a full-screen request when gameplay starts on supported browsers.
- [x] Add fallback CSS that always fills the viewport when full-screen permission is denied.
- [x] Add an exit button inside the HUD.
- [x] Make the exit button available on mobile touch and desktop.
- [x] On web, exit should pause the game and return to the menu or confirmation overlay.
- [x] On Tauri desktop, exit should optionally close the window after confirmation.
- [x] On mobile, exit should return to the main menu unless platform rules require different behavior.
- [x] Add a pause/settings button if exit needs a confirmation path.
- [x] Make sure exit controls do not overlap the joystick, action button, or HUD.

## Mobile And Desktop Input

- [x] Keep WASD and arrow movement.
- [x] Keep Space and E for planting.
- [x] Add mouse support for desktop players.
- [x] Add mouse click support for planting or interacting when the player is near an actionable object.
- [x] Add mouse drag support for rotating the camera view.
- [x] Add mouse wheel support for zooming the camera in and out.
- [x] Add optional click-to-move support if it feels good during playtesting.
- [x] Add click/tap support for menu and overlay controls.
- [x] Keep touch joystick for movement.
- [x] Keep touch action button for planting.
- [x] Add touch drag support for changing camera view on mobile if it does not conflict with joystick controls.
- [x] Add pinch zoom support for mobile camera zoom if playtesting confirms it is comfortable.
- [x] Add responsive placement for joystick and action button in portrait and landscape.
- [x] Add pointer events support so one input layer works across mouse, pen, and touch where practical.
- [x] Add input abstraction so keyboard, mouse, touch, and LLM all emit the same actions.
- [x] Add accessibility labels for controls.
- [x] Test desktop Chrome or Edge.
- [x] Test mobile viewport in browser dev tools.
- [ ] Test Android WebView through Tauri.
- [ ] Test iOS WebView through Tauri when macOS build access exists.

## Performance And Quality Tiers

- [x] Add a quality setting with at least `low` and `high` presets.
- [x] Default mobile devices to a conservative quality preset when needed.
- [x] Allow users to change quality from settings.
- [x] Reduce or disable expensive shadows on low quality.
- [x] Reduce decorative flower, particle, cloud, and object counts on low quality.
- [x] Lower pixel ratio on low quality if needed.
- [x] Add `prefers-reduced-motion` handling for UI animations and nonessential visual motion.
- [x] Keep gameplay readable on low quality.
- [x] Test low quality on mobile portrait and mobile landscape.
- [x] Test high quality on desktop.

## Camera And View Perspective

- [x] Add a camera controller that owns camera position, zoom, rotation, smoothing, and target tracking.
- [x] Preserve the current follow-camera behavior as the default view.
- [x] Add player-controlled camera rotation.
- [x] Add player-controlled camera zoom.
- [x] Add a reset-view button that returns to the default follow camera.
- [x] Add a view toggle button in the HUD or pause/settings screen.
- [x] Support at least two view presets: angled follow view and top-down view.
- [x] Consider adding an optional close third-person view after the controller is stable.
- [x] Save the selected view preset locally.
- [x] Make camera controls work with mouse on desktop.
- [x] Make camera controls work with touch gestures on mobile where practical.
- [x] Make camera controls available to the LLM API through observation metadata and optional camera actions.
- [x] Prevent camera movement from leaving the player, objectives, or action prompts off-screen.
- [x] Prevent camera UI from overlapping exit, sound, joystick, action, or mission controls.
- [x] Verify all view modes on desktop, mobile portrait, and mobile landscape.

## Offline Support

- [x] Remove all CDN scripts.
- [x] Remove all remote font links.
- [x] Bundle or vendor Three.js r128 locally for the first offline milestone.
- [x] Do not combine the first offline milestone with a Three.js major-version upgrade.
- [x] Bundle fonts locally.
- [x] Keep audio fully generated or bundle local audio assets.
- [x] Avoid network calls during gameplay.
- [x] Add a test that blocks network and verifies the game loads.
- [x] Add a service worker only if the web build must also support installable PWA behavior.
- [x] For Tauri builds, load the local static bundle from the app package.
- [x] Confirm no runtime dependency on Google Fonts, CDNJS, or external APIs.

## Tauri Project

- [x] Install Tauri CLI and required Rust tooling.
- [x] Add `src-tauri/`.
- [x] Configure Tauri to use the built web output.
- [x] Set app name, identifier, icons, window title, and default dimensions.
- [x] Configure desktop full-screen behavior.
- [x] Add commands for app exit, platform info, and optional file-safe local settings if needed.
- [x] Keep gameplay logic in web code so all platforms share the same implementation.
- [x] Add `npm run tauri:dev`.
- [x] Add `npm run tauri:build`.
- [x] Add Windows build configuration.
- [x] Add macOS build configuration.
- [x] Add Linux build configuration if the team wants it alongside Windows/macOS.
- [x] Add Android Tauri setup.
- [ ] Add iOS Tauri setup.
- [x] Document that iOS and macOS builds require macOS and Xcode.
- [x] Document that iOS App Store/TestFlight distribution requires an Apple Developer account.
- [x] Document that Android builds require Android Studio, SDK, NDK, and signing setup.
- [x] Add platform-specific icon assets.
- [x] Add signing/notarization tasks for release builds.

## Platform Release Tasks

- [x] Release order v1: Web offline build first.
- [x] Release order v1: Windows desktop through Tauri second.
- [x] Release order v1: Android third after SDK/signing setup is complete.
- [x] Release order v1: macOS and iOS only after Mac hardware, Xcode, signing, and Apple Developer access are available.
- [x] Windows: build `.msi` or `.exe` installer.
- [x] Windows: test offline launch after install.
- [ ] macOS: build `.dmg` or app bundle.
- [ ] macOS: test offline launch after install.
- [ ] macOS: complete signing and notarization for distribution.
- [x] Android: configure package id.
- [ ] Android: configure app icons and splash assets.
- [ ] Android: test on emulator.
- [ ] Android: test on a physical device.
- [ ] Android: configure release signing.
- [x] iOS: configure bundle id.
- [ ] iOS: configure app icons and launch assets.
- [ ] iOS: test on simulator.
- [ ] iOS: test on a physical device.
- [ ] iOS: configure signing and provisioning profiles.

## LLM Play Interface

- [x] Add an internal action API that accepts normalized actions: `move`, `plant`, `pause`, `resume`, `selectMode`, `selectLevel`, and `restart`.
- [x] Add high-level LLM actions: `moveToward(targetId)`, `collectNearest()`, `moveToNearestTrash()`, `moveToNearestPatch()`, `plantNearest()`, `chaseNearestVillain()`, and `attackBoss()`.
- [x] Add a game observation API that returns compact JSON state.
- [x] Include player position, velocity, heading, nearby trash, nearby patches, nearby villains, boss state, objectives, score, elapsed time, and level seed in observations.
- [x] Include stable object IDs in observations so the LLM can target specific trash, patches, villains, and boss entities.
- [x] Quantize positions and distances so observations are stable and token-efficient.
- [x] Hide rendering-only details from the LLM observation.
- [x] Add a browser debug panel or console hook named `window.QuantumGardenAgent`.
- [x] Implement `window.QuantumGardenAgent.observe()`.
- [x] Implement `window.QuantumGardenAgent.act(action)`.
- [x] Implement `window.QuantumGardenAgent.reset({ mode, levelId, seed })`.
- [x] Implement `window.QuantumGardenAgent.step(action)` for test runners.
- [x] Add rate limits or frame-step controls so the model cannot flood the game loop.
- [x] Add first-class turn-stepped headless mode for model evaluation.
- [x] Add real-time browser mode for demos.
- [x] Allow raw low-level movement actions and higher-level intent actions.
- [x] Add a Playwright-based agent harness that can call the browser API.
- [x] Add sample scripts showing how an external LLM agent can observe and act.
- [x] Add a safety boundary: the LLM API can control only the game, not the filesystem, OS, or Tauri commands.
- [x] For Tauri, expose the same browser-side API and avoid privileged native commands for LLM control.

## Testing And Verification

- [x] Add CI to run headless simulation tests, determinism tests, i18n checks, and offline build checks on push.
- [x] Add smoke tests for app startup.
- [x] Add headless simulation tests that run without WebGL.
- [x] Add tests for i18n key coverage in all four languages.
- [x] Add tests for fallback to English.
- [x] Add tests for RTL document direction in Arabic.
- [x] Add tests for seeded random determinism.
- [x] Add tests proving simulation results do not change with render frame rate.
- [x] Add tests that two runs with different seeds produce different layouts.
- [x] Add tests for single-player win conditions.
- [x] Add tests for two-player race result comparison.
- [x] Add tests for LLM `observe()` schema.
- [x] Add tests for LLM raw movement and planting actions.
- [x] Add tests for LLM high-level actions such as `moveToward(targetId)` and `plantNearest()`.
- [x] Add tests for scene teardown and Three.js disposal where practical.
- [x] Add visual checks for desktop viewport.
- [x] Add visual checks for mobile portrait viewport.
- [x] Add visual checks for mobile landscape viewport.
- [x] Add offline build test with network disabled.
- [x] Add Tauri desktop launch smoke test where CI support exists.

## Implementation Order

- [ ] Phase 1: Create build tooling, make level attempts self-contained, add teardown/disposal, move the current game into modules, separate simulation from rendering, and add fixed-timestep stepping.
  - [x] Phase 1 depends on Task Zero baseline protection.
  - [x] Phase 1 tests: headless simulation startup, seeded same-layout replay, different-seed different layout, fixed-timestep frame-rate independence, and teardown/disposal smoke test.
  - [ ] Phase 1 exit gate: gameplay simulation can run without WebGL, rendering syncs from simulation state, a level attempt can build/play/teardown/rebuild from seed, and the legacy parity checklist still passes.
- [ ] Phase 2: Replace CDN dependencies with offline local dependencies.
  - [x] Phase 2 depends on Phase 1 or an agreed minimal module split.
  - [x] Phase 2 tests: local build loads with network blocked, local Three r128 is used, local font is used, and no external runtime request is required.
  - [ ] Phase 2 exit gate: the browser build runs fully offline and matches the frozen baseline visually within accepted tolerance.
- [x] Phase 3: Add i18n and make English the default.
  - [x] Phase 3 depends on Phase 1 UI/module boundaries.
  - [x] Phase 3 tests: i18n key coverage, English fallback, Arabic RTL direction, and text-fit checks for English, Arabic, Spanish, and French.
  - [x] Phase 3 exit gate: English is default, all four languages can be selected, Arabic uses RTL, and no required UI string remains hard-coded in Arabic.
- [ ] Phase 4: Add mode registry and migrate current game to single-player mode.
  - [x] Phase 4 depends on Phase 1 sessions and simulation state.
  - [x] Phase 4 tests: mode registry loads, single-player mode starts, objectives update, and win conditions complete.
  - [ ] Phase 4 exit gate: current gameplay runs through the mode registry with no mode-specific logic hard-coded in the app shell.
- [x] Phase 5: Add level registry, seeded randomization, and deterministic replay.
  - [x] Phase 5 depends on Phase 1 simulation separation and seeded random helpers.
  - [x] Phase 5 tests: same seed produces same gameplay/decorative layout, different seeds vary layout, bad placements are rejected, and replay can reproduce a completed run.
  - [x] Phase 5 exit gate: new levels can be registered, accepted layouts pass solvability checks, and deterministic replay works.
- [x] Phase 6: Add full-screen handling, pause, exit, and responsive control refinements.
  - [x] Phase 6 depends on Phase 1 lifecycle hooks and Phase 3 localized UI.
  - [x] Phase 6 tests: pause freezes gameplay timers, exit clears pending timers, fullscreen fallback fills viewport, and controls do not overlap on desktop/mobile.
  - [x] Phase 6 exit gate: player can pause, resume, exit, retry, and return to menu without stale timers or state leaks.
- [x] Phase 7: Add mouse controls and camera perspective/view controls.
  - [x] Phase 7 depends on Phase 1 input abstraction and Phase 6 responsive HUD placement.
  - [x] Phase 7 tests: mouse click interaction, mouse camera drag, mouse wheel zoom, view reset, top-down view, follow view, and storage of selected view preset.
  - [x] Phase 7 exit gate: keyboard, mouse, and touch can all play a level; player can rotate, zoom, reset, and change camera view.
- [x] Phase 8: Add two-player race mode.
  - [x] Phase 8 depends on Phase 4 mode registry and Phase 5 deterministic same-seed replay.
  - [x] Phase 8 tests: Player 1 and Player 2 receive the same seed, handoff screen hides the route, both times are recorded, and winner comparison is correct.
  - [x] Phase 8 exit gate: two local players can complete a sequential same-seed race and see a correct winner summary.
- [x] Phase 9: Add LLM observation/action API and Playwright harness.
  - [x] Phase 9 depends on Phase 1 headless stepping and Phase 5 stable seeded IDs/layouts.
  - [x] Phase 9 tests: `observe()` schema, raw movement action, high-level target action, `plantNearest()`, reset by seed, and deterministic stepped evaluation.
  - [x] Phase 9 exit gate: an external harness can reset, observe, act, step, and complete basic objectives without direct DOM or WebGL control.
- [x] Phase 10: Add Tauri desktop project.
  - [x] Phase 10 depends on Phase 2 offline build and v0.1 web stability.
  - [x] Phase 10 tests: Tauri dev launch, desktop build launch, offline launch after install where practical, and exit behavior.
  - [x] Phase 10 exit gate: Windows desktop build launches offline from packaged local assets.
- [ ] Phase 11: Add Android and iOS Tauri setup.
  - [ ] Phase 11 depends on Phase 10 Tauri configuration and available mobile toolchains.
  - [ ] Phase 11 tests: Android emulator/device smoke test, iOS simulator/device smoke test when Mac/Xcode/signing are available.
  - [ ] Phase 11 exit gate: Android build path is proven; iOS remains gated until Apple requirements are satisfied.
- [x] Phase 12: Add packaging docs, platform release tasks, and final verification.
  - [x] Phase 12 depends on the target platform phases selected for release.
  - [x] Phase 12 tests: release checklist per platform, offline launch, settings persistence migration, and smoke gameplay.
  - [x] Phase 12 exit gate: selected release platforms have documented build, signing, test, and distribution steps.

## Acceptance Criteria

- [x] `web/index.html` has no inline game logic.
- [x] `web/index.html` has no inline CSS.
- [x] Gameplay simulation can run headlessly without WebGL.
- [x] Rendering syncs to simulation state instead of owning authoritative gameplay state.
- [x] Simulation uses a fixed timestep.
- [x] A level attempt can be built, played, torn down, disposed, and rebuilt from a seed.
- [x] Starting a new level does not keep stale patches, planted trees, villains, trash, or decorative objects unless explicitly designed.
- [x] The game runs in a browser from the local build.
- [x] The game runs without internet access.
- [x] English is the default language.
- [x] Arabic, English, Spanish, and French can be selected.
- [x] Arabic uses RTL layout.
- [x] The current gameplay remains playable after refactor.
- [x] New levels can be added by registering a new level definition.
- [x] New modes can be added by registering a new game mode.
- [x] Scene layout changes each attempt unless the same seed is reused.
- [x] Same seed produces the same gameplay and decorative layout.
- [x] Level unload disposes generated Three.js resources.
- [x] Single-player mode records completion time.
- [x] Two-player race mode declares the faster player.
- [x] The game enters full-screen or viewport-filling play mode.
- [x] An exit button is visible and usable during gameplay.
- [x] Touch controls work on mobile.
- [x] Keyboard controls work on desktop.
- [x] Mouse controls work on desktop.
- [x] Player can rotate, zoom, reset, and change camera view perspective.
- [x] Tauri desktop build launches.
- [x] Android build path is documented and configured.
- [x] iOS build path is documented and configured.
- [x] `window.QuantumGardenAgent.observe()` returns valid state.
- [x] `window.QuantumGardenAgent.act()` can control the player.
- [x] LLM can use both low-level actions and high-level target actions.

## Risks And Decisions

- [x] Decide whether to use Vite or keep a no-bundler ES module setup.
- [x] Decide whether to add a service worker for the web version or rely only on Tauri packaging for offline distribution.
- [x] Decide whether LLM play should be turn-stepped for evaluation, real-time for demos, or support both.
- [x] Confirm target Tauri version before mobile setup because mobile support requirements can change.
- [x] Treat deterministic simulation as the highest-risk part of the refactor because the current code mixes random generation, gameplay state, and rendering.
- [x] Treat modern Three.js upgrade as out of scope for the first offline milestone unless a blocker requires it.
- [x] Track Apple platform work as blocked until required hardware and account access are confirmed.
