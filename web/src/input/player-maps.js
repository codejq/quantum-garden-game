export const PLAYER_INPUT_MAPS = {
  player1: {
    moveUp: ['KeyW'],
    moveDown: ['KeyS'],
    moveLeft: ['KeyA'],
    moveRight: ['KeyD'],
    plant: ['Space'],
  },
  player2: {
    moveUp: ['ArrowUp'],
    moveDown: ['ArrowDown'],
    moveLeft: ['ArrowLeft'],
    moveRight: ['ArrowRight'],
    plant: ['Enter', 'NumpadEnter'],
  },
};

export function inputMapFor(playerId) {
  return PLAYER_INPUT_MAPS[playerId] ?? PLAYER_INPUT_MAPS.player1;
}

export function inputVector(keys, inputMap = PLAYER_INPUT_MAPS.player1) {
  const pressed = (action) => inputMap[action].some((code) => keys[code]);
  let x = 0;
  let z = 0;
  if (pressed('moveUp')) z -= 1;
  if (pressed('moveDown')) z += 1;
  if (pressed('moveLeft')) x -= 1;
  if (pressed('moveRight')) x += 1;
  const length = Math.hypot(x, z);
  return length > 1 ? { x: x / length, z: z / length } : { x, z };
}

export function isPlantInput(code, inputMap = PLAYER_INPUT_MAPS.player1) {
  return inputMap.plant.includes(code);
}
