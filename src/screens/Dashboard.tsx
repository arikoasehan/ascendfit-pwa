// screens/Dashboard.tsx
// Port of Views/Dashboard/DashboardView.swift.

import { useState, useCallback } from 'react';
import type { Quest, StatBlock } from '../types';
import { rankIndex } from '../types';
import { totalXPRequired, statLevel, characterLevel, rankForLevel } from '../engine/LevelEngine';
import { db } from '../db/database';
import { HoloPanel, NeonProgressBar, QuestPopup } from '../components/Shared';
import type { ApplyResult } from '../engine/XPEngine';

export function Dashboard({
  statBlock,
  quests,
  onStartWorkout,
  onLevelUp,
}: {
  statBlock: StatBlock;
  quests: Quest[];
  onStartWorkout: () => void;
  onLevelUp: (info: ApplyResult) => void;
}) {
  const [toastQuest, setToastQuest] = useState<Quest | null>(null);

  const floor = totalXPRequired(statBlock.currentLevel);
  const ceiling = totalXPRequired(statBlock.currentLevel + 1);
  const current = statBlock.totalXP - floor;
  const required = ceiling - floor;
  const frac = required > 0 ? Math.min(current / required, 1) : 0;
  const completedCount = quests.filter((q) => q.isComplete).length;

  const completeQuest = useCallback(
    async (quest: Quest) => {
      if (quest.isComplete) return;
      await db.quests.update(quest.id, { isComplete: true, currentValue: quest.targetValue, completedAt: new Date().toISOString() });
      setToastQuest(quest);

      // Manual-completion Directives award flat XP straight to Discipline,
      // same rule as DashboardViewModel.completeQuest in the Swift app.
      const newDisciplineXP = statBlock.disciplineXP + quest.xpReward;
      const newDisciplineLevel = statLevel(newDisciplineXP);
      const newTotalXP = statBlock.totalXP + quest.xpReward;
      const newLevel = characterLevel(newTotalXP);
      const newRank = rankForLevel(newLevel);
      const leveledUp = newLevel > statBlock.currentLevel || rankIndex(newRank) > rankIndex(statBlock.currentRank);

      await db.statBlocks.update(statBlock.id, {
        disciplineXP: newDisciplineXP,
        disciplineLevel: newDisciplineLevel,
        totalXP: newTotalXP,
        currentLevel: newLevel,
        currentRank: newRank,
      });

      if (leveledUp) {
        onLevelUp({
          next: { ...statBlock, disciplineXP: newDisciplineXP, disciplineLevel: newDisciplineLevel, totalXP: newTotalXP, currentLevel: newLevel, currentRank: newRank },
          statsLeveledUp: ['discipline'],
          characterLeveledUp: newLevel > statBlock.currentLevel,
          rankedUp: rankIndex(newRank) > rankIndex(statBlock.currentRank),
          previousCharacterLevel: statBlock.currentLevel,
          newCharacterLevel: newLevel,
          previousRank: statBlock.currentRank,
          newRank,
        });
      }
    },
    [statBlock, onLevelUp]
  );

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wide text-accent-secondary">RANK: {statBlock.currentRank.toUpperCase()}</span>
        <span className="text-text-secondary" aria-label="Settings">\u2699</span>
      </div>

      <HoloPanel>
        <div className="text-3xl font-mono font-bold mb-2 text-text-primary">LV. {statBlock.currentLevel}</div>
        <NeonProgressBar progress={frac} />
        <div className="text-xs mt-2 text-text-secondary">
          {Math.round(current)} / {Math.round(required)} XP
        </div>
      </HoloPanel>

      <HoloPanel>
        <div className="flex items-center gap-2">
          <span className="text-accent-primary">\u223F</span>
          <span className="text-xs text-text-primary">TODAY'S LOAD: STANDARD</span>
        </div>
      </HoloPanel>

      <HoloPanel>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">DIRECTIVES</span>
          <span className="text-xs text-text-secondary">
            {completedCount}/{quests.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {quests.map((q) => (
            <button key={q.id} disabled={q.isComplete} onClick={() => completeQuest(q)} className="flex items-center gap-2 text-left">
              <span className={q.isComplete ? 'text-accent-success' : 'text-text-secondary'}>{q.isComplete ? '\u25CF' : '\u25CB'}</span>
              <span className={`text-sm ${q.isComplete ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{q.title}</span>
            </button>
          ))}
        </div>
      </HoloPanel>

      <button onClick={onStartWorkout} className="py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 bg-accent-primary text-bg-void">
        \u25B6 START WORKOUT
      </button>

      <QuestPopup quest={toastQuest} onDone={() => setToastQuest(null)} />
    </div>
  );
}
