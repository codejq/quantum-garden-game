export function show(element) {
  if (element) element.style.display = 'flex';
}

export function hide(element) {
  if (element) element.style.display = 'none';
}

export function setText(element, text) {
  if (element) element.textContent = text;
}

export function levelSummary({ score, trees, trash, elapsed, bestTime }) {
  return {
    score,
    trees,
    trash,
    elapsed,
    bestTime,
    isBest: bestTime == null || elapsed <= bestTime,
  };
}

export function bindQualitySelect(select, { readQuality, writeQuality, applyQuality }) {
  if (!select) return () => {};
  select.value = readQuality();
  const change = () => {
    const save = writeQuality(select.value);
    applyQuality?.(save.quality);
  };
  select.addEventListener('change', change);
  return () => select.removeEventListener('change', change);
}
