import { QuantumGardenAgent } from '../web/src/input/llm-agent.js';

const agent = new QuantumGardenAgent({ tick: 1 / 30 });
let observation = agent.reset({ mode: 'single-player', levelId: 1, seed: 'llm-sample' });
const transcript = [];

function chooseAction(state) {
  if (state.objectives.trashLeft > 0) return { type: 'moveToNearestTrash' };
  if (state.objectives.trees.done < state.objectives.trees.total) return { type: 'moveToNearestPatch' };
  if (state.boss) return { type: 'attackBoss' };
  if (state.nearby.villains.length > 0) return { type: 'chaseNearestVillain' };
  return { type: 'move', x: 0, z: 0 };
}

for (let step = 0; step < 20; step += 1) {
  const action = chooseAction(observation);
  observation = agent.step(action);
  if (action.type === 'moveToNearestPatch') observation = agent.step({ type: 'plantNearest' });
  transcript.push({
    step,
    action: action.type,
    status: observation.status,
    score: observation.score,
    trashLeft: observation.objectives.trashLeft,
    player: observation.player,
  });
}

console.log(
  JSON.stringify(
    {
      sample: 'quantum-garden-llm-agent',
      seed: observation.seed,
      finalStatus: observation.status,
      finalScore: observation.score,
      steps: transcript,
    },
    null,
    2,
  ),
);
