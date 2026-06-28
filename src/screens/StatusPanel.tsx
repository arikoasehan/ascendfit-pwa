// screens/StatusPanel.tsx
// Port of Views/StatusPanel/StatusPanelView.swift.

import { STAT_TYPES, type StatBlock, type StatType, type WorkoutSession } from '../types';
import { HoloPanel } from '../components/Shared';
import { StatRadar } from '../components/StatRadar';

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

export function StatusPanel({ statBlock, sessions }: { statBlock: StatBlock; sessions: WorkoutSession[] }) {
  const totalVolume = sessions.reduce((acc, s) => acc + s.totalVolumeKG, 0);
  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="text-xl font-bold tracking-wide text-text-primary">STATUS PANEL</div>
      <HoloPanel>
        <StatRadar statBlock={statBlock} />
      </HoloPanel>
      <HoloPanel>
        <div className="flex flex-col gap-2.5">
          {STAT_TYPES.map((stat) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-sm uppercase text-text-primary">{stat}</span>
              <span className="font-mono font-bold text-accent-primary">{statLevelFor(statBlock, stat)}</span>
            </div>
          ))}
        </div>
      </HoloPanel>
      <HoloPanel>
        <div className="flex flex-col gap-2">
          <Row label="Lifetime sessions" value={String(sessions.length)} />
          <Row label="Total volume" value={`${Math.round(totalVolume)} kg`} />
        </div>
      </HoloPanel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="font-mono font-bold text-sm text-text-primary">{value}</span>
    </div>
  );
}
