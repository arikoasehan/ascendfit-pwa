// screens/Achievements.tsx
// Port of Views/Achievements/AchievementsView.swift.

import type { Achievement } from '../types';
import { HoloPanel } from '../components/Shared';

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="text-xs text-text-secondary">
        {unlockedCount}/{achievements.length} unlocked
      </div>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => {
          const isLockedHidden = a.isHidden && !a.isUnlocked;
          return (
            <HoloPanel key={a.id} className={a.isUnlocked ? '' : 'opacity-60'}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl">{isLockedHidden ? '\u2753' : a.icon}</span>
                <span className={`text-xs ${a.isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {isLockedHidden ? '???' : a.title}
                </span>
              </div>
            </HoloPanel>
          );
        })}
      </div>
    </div>
  );
}
