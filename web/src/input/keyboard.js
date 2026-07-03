export function keyboardVector(keys) {
  let x = 0;
  let z = 0;
  if (keys.KeyW || keys.ArrowUp) z -= 1;
  if (keys.KeyS || keys.ArrowDown) z += 1;
  if (keys.KeyA || keys.ArrowLeft) x -= 1;
  if (keys.KeyD || keys.ArrowRight) x += 1;
  const length = Math.hypot(x, z);
  return length > 1 ? { x: x / length, z: z / length } : { x, z };
}

export function isPlantKey(code) {
  return code === 'Space' || code === 'KeyE';
}

export function createKeyboardInput(target, actions) {
  const keys = {};
  const down = (event) => {
    keys[event.code] = true;
    if (isPlantKey(event.code)) {
      event.preventDefault?.();
      actions.plant?.();
    }
    actions.move?.(keyboardVector(keys));
  };
  const up = (event) => {
    keys[event.code] = false;
    actions.move?.(keyboardVector(keys));
  };
  target.addEventListener('keydown', down);
  target.addEventListener('keyup', up);
  return () => {
    target.removeEventListener('keydown', down);
    target.removeEventListener('keyup', up);
  };
}

