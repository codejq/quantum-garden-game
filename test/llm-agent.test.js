import test from 'node:test';
import assert from 'node:assert/strict';
import { QuantumGardenAgent } from '../web/src/input/llm-agent.js';

test('LLM agent can reset and observe compact game state', () => {
  const agent = new QuantumGardenAgent();
  const observation = agent.reset({ levelId: 1, seed: 'agent' });
  assert.equal(observation.status, 'running');
  assert.equal(observation.seed, 'agent');
  assert.equal(Array.isArray(observation.nearby.trash), true);
  assert.equal(typeof observation.objectives.trashLeft, 'number');
  assert.equal(typeof observation.player.vx, 'number');
  assert.equal('boss' in observation, true);
});

test('LLM raw move action controls player movement', () => {
  const agent = new QuantumGardenAgent();
  const before = agent.reset({ levelId: 1, seed: 'move-agent' }).player.x;
  const after = agent.step({ type: 'move', x: 1, z: 0 }).player.x;
  assert.ok(after > before);
});

test('LLM high-level moveToward targets stable object ids', () => {
  const agent = new QuantumGardenAgent();
  const observation = agent.reset({ levelId: 1, seed: 'target-agent' });
  const targetId = observation.nearby.trash[0].id;
  const after = agent.step({ type: 'moveToward', targetId });
  assert.equal(after.status, 'running');
});

test('LLM plantNearest emits a planting action without DOM access', () => {
  const agent = new QuantumGardenAgent();
  agent.reset({ levelId: 1, seed: 'plant-agent' });
  const after = agent.step({ type: 'plantNearest' });
  assert.equal(after.status, 'running');
});

test('LLM agent supports mode and level selection actions', () => {
  const agent = new QuantumGardenAgent();
  agent.reset({ levelId: 1, seed: 'select-agent' });
  assert.equal(agent.act({ type: 'selectMode', mode: 'single-player' }).mode, 'single-player');
  const levelObservation = agent.act({ type: 'selectLevel', levelId: 2, seed: 'level-two' });
  assert.equal(levelObservation.level, 2);
  assert.equal(levelObservation.seed, 'level-two');
});

test('LLM agent can complete basic objectives without DOM or WebGL control', () => {
  const agent = new QuantumGardenAgent({ tick: 1 / 30 });
  let observation = agent.reset({
    levelId: 1,
    seed: 'basic-objectives',
    spawnRules: { trash: 1, patches: 1, minionQuota: 0, bossRequired: false },
  });

  for (let frame = 0; frame < 900 && observation.status !== 'complete'; frame += 1) {
    if (observation.objectives.trashLeft > 0) {
      observation = agent.step({ type: 'moveToNearestTrash' });
    } else if (observation.objectives.trees.done < observation.objectives.trees.total) {
      observation = agent.step({ type: 'moveToNearestPatch' });
      observation = agent.step({ type: 'plantNearest' });
    } else {
      observation = agent.step();
    }
  }

  assert.equal(observation.objectives.trashLeft, 0);
  assert.equal(observation.objectives.trees.done, observation.objectives.trees.total);
  assert.equal(observation.status, 'complete');
});

test('LLM agent supports human-like seeded play steps', () => {
  const agent = new QuantumGardenAgent({ tick: 1 / 30 });
  agent.reset({
    levelId: 1,
    seed: 'human-agent',
    spawnRules: { trash: 1, patches: 1, minionQuota: 0, bossRequired: false },
  });

  const status = agent.setHumanMode({ seed: 'human-agent', minThinkMs: 40, maxThinkMs: 80, actionMs: 60 });
  assert.equal(status.enabled, true);

  const result = agent.humanStep({ maxMs: 300 });
  assert.equal(result.human.enabled, true);
  assert.equal(typeof result.observation.player.x, 'number');
  assert.ok(result.human.plan === null || typeof result.human.plan.type === 'string');
});

test('LLM agent can advance to the next level through the agent API', () => {
  const agent = new QuantumGardenAgent();
  agent.reset({ levelId: 1, seed: 'level-one' });
  const observation = agent.act({ type: 'nextLevel', levelId: 2, seed: 'level-two' });
  assert.equal(observation.level, 2);
  assert.equal(observation.seed, 'level-two');
});
