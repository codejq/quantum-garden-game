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
