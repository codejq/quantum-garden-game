# Adding Modes And Levels

## Add A Game Mode

1. Create a file in `web/src/modes/`.
2. Export an object with `id`, `nameKey`, `setup()`, `start()`, `update()`, `onObjectiveEvent()`, `isComplete()`, and `getResults()`.
3. Keep mode-specific scoring, result summaries, and completion rules inside the mode.
4. Use `GameSession` for simulation state instead of storing gameplay state in DOM or Three.js meshes.
5. Register the mode in `web/src/modes/mode-registry.js`.
6. Add tests for setup, start, update, completion, and results.

## Add A Level

1. Create a file in `web/src/levels/`.
2. Export a level definition with `id`, `nameKey`, `difficulty`, `world`, `objectives`, `spawnRules`, `timer`, `boss`, and `randomization`.
3. Use seeded random helpers and `web/src/world/spawners.js` for generated placement.
4. Validate generated layouts with `web/src/levels/solvability.js`.
5. Register the level in `web/src/levels/level-registry.js`.
6. Add tests that verify the level can be found, seeded layouts are deterministic, and invalid placements are rejected.

## Rules Of Thumb

- Simulation state belongs in plain JavaScript data.
- Rendering reads simulation state; it does not own authoritative gameplay state.
- Every object that is created for an attempt must have a cleanup path.
- New modes and levels should work headlessly before they are wired to the browser UI.

