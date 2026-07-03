# Baseline Gameplay Checklist

Use this checklist against `web/legacy/index.html` and the active game before marking a refactor phase as behavior-compatible.

- [x] Start screen appears.
- [x] Start button begins the game.
- [x] HUD appears after start.
- [x] Player moves with WASD.
- [x] Player moves with arrow keys.
- [x] Sound toggle changes the sound icon.
- [x] Player collects trash by walking over it.
- [x] Score increases after collecting trash.
- [x] Player can plant a tree when standing near a glowing patch.
- [x] Tree count increases after planting.
- [x] Mission card updates trash, tree, minion, and boss objectives.
- [x] Minion can be converted by touching it.
- [x] Boss appears after the initial delay.
- [x] Boss requires multiple touches before defeat.
- [x] Pollution meter changes as the level is cleaned.
- [x] Level-complete overlay appears after all objectives are complete.
- [x] Next-level button starts another level.
- [x] Touch joystick appears on touch-capable viewport/device.
- [x] Touch action button appears on touch-capable viewport/device.

## Automated Evidence

- Active built game parity verified by `npm run test:baseline-parity` at 2026-07-03T23:58:13.014Z.
- Target: `dist/web/index.html`.
- Frozen legacy structure remains captured in `docs/baseline-snapshot.json` and `web/legacy/index.html`.
