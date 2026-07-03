export function missionRows({ trashLeft, treesDone, treesTotal, minionsDone, minionsTotal, bossDefeated }, t = (key) => key) {
  return [
    { id: 'trash', done: trashLeft === 0, icon: trashLeft === 0 ? '✅' : '🗑️', label: t('trashLeft'), value: String(trashLeft) },
    { id: 'trees', done: treesDone === treesTotal, icon: treesDone === treesTotal ? '✅' : '🌱', label: t('trees'), value: `${treesDone}/${treesTotal}` },
    { id: 'minions', done: minionsDone >= minionsTotal, icon: minionsDone >= minionsTotal ? '✅' : '😈', label: t('minions'), value: `${minionsDone}/${minionsTotal}` },
    { id: 'boss', done: bossDefeated, icon: bossDefeated ? '✅' : '🎩', label: t('boss'), value: '' },
  ];
}

export function objectiveRows(objectives, state, t = (key) => key) {
  return objectives.map((objective) => {
    const done = Boolean(objective.done(state));
    const value = objective.value ? objective.value(state) : '';
    return {
      id: objective.id,
      done,
      icon: done ? (objective.completeIcon ?? '✅') : objective.icon,
      label: t(objective.labelKey),
      value,
    };
  });
}

export function renderMissionHtml(rows) {
  return rows
    .map((row) => `<div class="${row.done ? 'done' : ''}">${row.icon} ${row.label}${row.value ? `: <b>${row.value}</b>` : ''}</div>`)
    .join('');
}

export function cleanlinessPercent(pollution) {
  return Math.round((1 - Math.max(0, Math.min(100, pollution)) / 100) * 100);
}

export function meterGradient(percent) {
  if (percent > 66) return 'linear-gradient(90deg,#51cf66,#2f9e44)';
  if (percent > 33) return 'linear-gradient(90deg,#ffd166,#f59f00)';
  return 'linear-gradient(90deg,#a3742f,#7a5230)';
}
