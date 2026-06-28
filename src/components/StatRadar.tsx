// components/StatRadar.tsx
// Port of Views/StatusPanel/StatRadarChart.swift — hand-drawn SVG hexagon,
// same approach as the SwiftUI Path-based version (Swift Charts doesn't do
// radar charts either, so this was always a custom draw on both platforms).

import { STAT_TYPES, type StatBlock, type StatType } from '../types';

const STAT_LABELS: Record<StatType, string> = {
  strength: 'STR',
  endurance: 'END',
  agility: 'AGI',
  discipline: 'DIS',
  recovery: 'REC',
  vitality: 'VIT',
};

function statLevelFor(block: StatBlock, stat: StatType): number {
  switch (stat) {
    case 'strength': return block.strengthLevel;
    case 'endurance': return block.enduranceLevel;
    case 'agility': return block.agilityLevel;
    case 'discipline': return block.disciplineLevel;
    case 'recovery': return block.recoveryLevel;
    case 'vitality': return block.vitalityLevel;
  }
}

export function StatRadar({ statBlock, maxLevel = 20 }: { statBlock: StatBlock; maxLevel?: number }) {
  const size = 220;
  const center = size / 2;
  const radius = size / 2 - 28;
  const angle = (i: number) => (i / STAT_TYPES.length) * 2 * Math.PI - Math.PI / 2;
  const pointAt = (i: number, frac: number) => ({
    x: center + radius * frac * Math.cos(angle(i)),
    y: center + radius * frac * Math.sin(angle(i)),
  });

  const ringPath = (frac: number) =>
    STAT_TYPES.map((_, i) => pointAt(i, frac))
      .map((p) => `${p.x},${p.y}`)
      .join(' ');

  const dataPoints = STAT_TYPES.map((stat, i) => {
    const level = statLevelFor(statBlock, stat);
    const frac = Math.min(level / maxLevel, 1);
    return pointAt(i, frac);
  });
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} className="mx-auto">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ringPath(f)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      ))}
      {STAT_TYPES.map((_, i) => {
        const p = pointAt(i, 1);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
      })}
      <polygon points={dataPath} fill="rgba(61,231,255,0.2)" stroke="#3DE7FF" strokeWidth={2} />
      {STAT_TYPES.map((stat, i) => {
        const p = pointAt(i, 1.18);
        return (
          <text key={stat} x={p.x} y={p.y} fontSize={9} fill="#7E8AA3" textAnchor="middle" fontWeight={600}>
            {STAT_LABELS[stat]}
          </text>
        );
      })}
    </svg>
  );
}
