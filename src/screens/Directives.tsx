// screens/Directives.tsx
// Port of Views/Directives/DirectivesView.swift + DirectiveRow.swift.

import { useState } from 'react';
import type { Quest, QuestCategory } from '../types';
import { db } from '../db/database';
import { HoloPanel, NeonProgressBar } from '../components/Shared';

const CATEGORY_ICON: Record<QuestCategory, string> = {
  steps: '\u{1F6B6}',
  workout: '\u{1F3CB}',
  hydration: '\u{1F4A7}',
  sleep: '\u{1F319}',
  mobility: '\u{1F9D8}',
  weightChange: '\u2696',
  distance: '\u{1F4CD}',
  custom: '\u2728',
};

export function Directives({ daily, weekly }: { daily: Quest[]; weekly: Quest[] }) {
  const [segment, setSegment] = useState<'daily' | 'weekly'>('daily');
  const list = segment === 'daily' ? daily : weekly;

  const markComplete = async (quest: Quest) => {
    if (quest.isComplete) return;
    await db.quests.update(quest.id, { isComplete: true, currentValue: quest.targetValue, completedAt: new Date().toISOString() });
  };

  return (
    <div className="flex flex-col gap-3 p-4 pb-24">
      <div className="flex rounded-xl overflow-hidden bg-white/5 p-1">
        <button
          onClick={() => setSegment('daily')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${segment === 'daily' ? 'bg-accent-primary text-bg-void' : 'text-text-secondary'}`}
        >
          DAILY
        </button>
        <button
          onClick={() => setSegment('weekly')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${segment === 'weekly' ? 'bg-accent-primary text-bg-void' : 'text-text-secondary'}`}
        >
          WEEKLY
        </button>
      </div>

      {list.map((quest) => (
        <HoloPanel key={quest.id}>
          <div className="flex items-center gap-3">
            <span className={`text-lg ${quest.isComplete ? 'opacity-100' : 'opacity-70'}`}>{CATEGORY_ICON[quest.category]}</span>
            <div className="flex-1">
              <div className="text-sm text-text-primary">{quest.title}</div>
              {quest.isComplete ? (
                <div className="text-xs text-accent-success">\u2713 Done &nbsp; +{Math.round(quest.xpReward)}XP</div>
              ) : quest.sourceIsManualOnly ? (
                <button onClick={() => markComplete(quest)} className="text-xs text-accent-primary mt-1">
                  Mark complete
                </button>
              ) : (
                <div className="mt-1">
                  <NeonProgressBar progress={quest.targetValue > 0 ? quest.currentValue / quest.targetValue : 0} height={6} />
                  <div className="text-xs text-text-secondary mt-1">
                    {Math.round(quest.currentValue)} / {Math.round(quest.targetValue)} {quest.unit}
                  </div>
                </div>
              )}
            </div>
          </div>
        </HoloPanel>
      ))}

      {list.length === 0 && <div className="text-sm text-text-secondary text-center mt-8">No {segment} quests yet.</div>}
    </div>
  );
}
