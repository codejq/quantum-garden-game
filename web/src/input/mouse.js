export function createMouseInput(target, actions) {
  let dragging = false;
  let last = null;

  const down = (event) => {
    dragging = true;
    last = { x: event.clientX, y: event.clientY };
  };
  const move = (event) => {
    if (!dragging || !last) return;
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    actions.cameraRotate?.({ dx, dy });
  };
  const up = () => {
    dragging = false;
    last = null;
  };
  const wheel = (event) => {
    actions.cameraZoom?.({ delta: event.deltaY });
  };
  const click = (event) => {
    actions.interact?.({ x: event.clientX, y: event.clientY });
  };

  target.addEventListener('pointerdown', down);
  target.addEventListener('pointermove', move);
  target.addEventListener('pointerup', up);
  target.addEventListener('pointercancel', up);
  target.addEventListener('wheel', wheel);
  target.addEventListener('click', click);

  return () => {
    target.removeEventListener('pointerdown', down);
    target.removeEventListener('pointermove', move);
    target.removeEventListener('pointerup', up);
    target.removeEventListener('pointercancel', up);
    target.removeEventListener('wheel', wheel);
    target.removeEventListener('click', click);
  };
}

