export function joystickVector(touch, rect, margin = 10) {
  let dx = touch.clientX - (rect.left + rect.width / 2);
  let dy = touch.clientY - (rect.top + rect.height / 2);
  const max = rect.width / 2 - margin;
  const length = Math.hypot(dx, dy);
  if (length > max) {
    dx *= max / length;
    dy *= max / length;
  }
  return {
    x: dx / max,
    z: dy / max,
    knobX: dx,
    knobY: dy,
  };
}

export function isTouchDevice(navigatorLike = globalThis.navigator) {
  return 'ontouchstart' in globalThis || (navigatorLike?.maxTouchPoints ?? 0) > 0;
}

export function createTouchInput({ joystick, actionButton }, actions, options = {}) {
  const margin = options.margin ?? 10;
  let activePointerId = null;

  const resetJoystick = () => {
    activePointerId = null;
    actions.move?.({ x: 0, z: 0 });
  };

  const joystickDown = (event) => {
    activePointerId = event.pointerId;
    event.preventDefault?.();
    const vector = joystickVector(event, joystick.getBoundingClientRect(), margin);
    actions.move?.({ x: vector.x, z: vector.z });
    actions.knob?.({ x: vector.knobX, y: vector.knobY });
  };

  const joystickMove = (event) => {
    if (event.pointerId !== activePointerId) return;
    event.preventDefault?.();
    const vector = joystickVector(event, joystick.getBoundingClientRect(), margin);
    actions.move?.({ x: vector.x, z: vector.z });
    actions.knob?.({ x: vector.knobX, y: vector.knobY });
  };

  const plant = (event) => {
    event.preventDefault?.();
    actions.plant?.();
  };

  joystick.addEventListener('pointerdown', joystickDown);
  joystick.addEventListener('pointermove', joystickMove);
  joystick.addEventListener('pointerup', resetJoystick);
  joystick.addEventListener('pointercancel', resetJoystick);
  actionButton.addEventListener('pointerdown', plant);

  return () => {
    joystick.removeEventListener('pointerdown', joystickDown);
    joystick.removeEventListener('pointermove', joystickMove);
    joystick.removeEventListener('pointerup', resetJoystick);
    joystick.removeEventListener('pointercancel', resetJoystick);
    actionButton.removeEventListener('pointerdown', plant);
  };
}

function distanceBetween(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export function createTouchCameraInput(target, actions) {
  const pointers = new Map();
  let lastDrag = null;
  let lastPinchDistance = null;

  const down = (event) => {
    pointers.set(event.pointerId, event);
    target.setPointerCapture?.(event.pointerId);
    if (pointers.size === 1) lastDrag = { x: event.clientX, y: event.clientY };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      lastPinchDistance = distanceBetween(a, b);
      lastDrag = null;
    }
  };

  const move = (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, event);
    event.preventDefault?.();

    if (pointers.size === 1 && lastDrag) {
      const dx = event.clientX - lastDrag.x;
      const dy = event.clientY - lastDrag.y;
      lastDrag = { x: event.clientX, y: event.clientY };
      actions.cameraRotate?.({ dx, dy });
      return;
    }

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const distance = distanceBetween(a, b);
      if (lastPinchDistance !== null) actions.cameraZoom?.({ delta: lastPinchDistance - distance });
      lastPinchDistance = distance;
    }
  };

  const up = (event) => {
    pointers.delete(event.pointerId);
    target.releasePointerCapture?.(event.pointerId);
    lastPinchDistance = null;
    const remaining = [...pointers.values()][0];
    lastDrag = remaining ? { x: remaining.clientX, y: remaining.clientY } : null;
  };

  target.addEventListener('pointerdown', down);
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', up);
  target.addEventListener('pointercancel', up);

  return () => {
    target.removeEventListener('pointerdown', down);
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', up);
    target.removeEventListener('pointercancel', up);
  };
}
