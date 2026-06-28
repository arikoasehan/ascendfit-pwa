// db/achievementSeed.ts
// Mirrors AscendFit/Resources/AchievementSeedData.swift — IDs must match
// engine/AchievementEvaluator.ts keys exactly.

import type { Achievement } from '../types';

export const ACHIEVEMENT_SEED: Omit<Achievement, 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first workout session.',
    icon: '\u{1F463}',
    isHidden: false,
    unlockCondition: 'Complete 1 workout session.',
  },
  {
    id: 'thirty_day_streak',
    title: '30 Days Strong',
    description: 'Reach a 30-day training streak.',
    icon: '\u{1F525}',
    isHidden: false,
    unlockCondition: 'Reach a 30-day streak.',
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete every daily Directive for 7 days in a row.',
    icon: '\u2B50',
    isHidden: false,
    unlockCondition: 'Complete all daily Directives for 7 consecutive days.',
  },
  {
    id: 'night_owl_override',
    title: 'Night Owl Override',
    description: '???',
    icon: '\u{1F319}',
    isHidden: true,
    unlockCondition: 'Complete a workout after 10pm, three times.',
  },
  {
    id: 'across_the_threshold',
    title: 'Across the Threshold',
    description: '???',
    icon: '\u21A9',
    isHidden: true,
    unlockCondition: 'Return to training after a 14+ day gap.',
  },
  {
    id: 'iron_will',
    title: 'Iron Will',
    description: '???',
    icon: '\u26A1',
    isHidden: true,
    unlockCondition: 'Complete 5 consecutive sessions logged at a hard target RPE.',
  },
  {
    id: 'bronze_rank_reached',
    title: 'Bronze Rank',
    description: 'Reach Bronze rank.',
    icon: '\u{1F6E1}',
    isHidden: false,
    unlockCondition: 'Reach Character Level 10.',
  },
  {
    id: 'silver_rank_reached',
    title: 'Silver Rank',
    description: 'Reach Silver rank.',
    icon: '\u{1F6E1}',
    isHidden: false,
    unlockCondition: 'Reach Character Level 20.',
  },
  {
    id: 'gold_rank_reached',
    title: 'Gold Rank',
    description: 'Reach Gold rank.',
    icon: '\u{1F451}',
    isHidden: false,
    unlockCondition: 'Reach Character Level 35.',
  },
];
