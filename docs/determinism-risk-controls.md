# Determinism Risk Controls

Deterministic simulation is the highest-risk part of the refactor because the original prototype mixed random generation, gameplay state, timers, and Three.js mesh state inside one browser loop. The project treats this as a release gate, not a polish task.

Controls that must stay in place:

- Gameplay simulation must run headlessly without DOM, canvas, or WebGL.
- Level attempts must be created from an explicit seed.
- Same seed must reproduce interactive object layout, decorative layout, and stable IDs.
- Different seeds must produce different accepted layouts.
- Fixed total simulation time must produce the same result when stepped with different frame slices.
- Level attempts must support build, play, teardown, dispose, and rebuild from the same seed.
- LLM evaluation must use the same public action and observation API as tests.
- CI must run the headless tests and offline build checks on push and pull request.

The phase gates in `docs/modular-offline-tauri-roadmap.md` should remain blocked whenever any of these controls fail.
