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

