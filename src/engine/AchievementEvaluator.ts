// engine/AchievementEvaluator.ts
// Direct port of Engine/AchievementEvaluator.swift.

import { rankIndex, type Rank } from '../types';

export interface EvaluationContext {
  totalSessionsCompleted: number;
  currentStreakDays: number;
  longestStreakDays: number;
  perfectDirectiveDaysInARow: number;
  sessionsAfter10PMCount: number;
  daysSinceLastSessionBeforeThisOne?: number;
  consecutiveHardRPESessions: number;
  characterLevel: number;
  rank: Rank;
}

const evaluators: Record<string, (ctx: EvaluationContext) => boolean> = {
  first_step: (ctx) => ctx.totalSessionsCompleted >= 1,
  thirty_day_streak: (ctx) => ctx.longestStreakDays >= 30,
  perfect_week: (ctx) => ctx.perfectDirectiveDaysInARow >= 7,
  night_owl_override: (ctx) => ctx.sessionsAfter10PMCount >= 3,
  across_the_threshold: (ctx) => (ctx.daysSinceLastSessionBeforeThisOne ?? 0) >= 14,
  iron_will: (ctx) => ctx.consecutiveHardRPESessions >= 5,
  bronze_rank_reached: (ctx) => rankIndex(ctx.rank) >= rankIndex('bronze'),
  silver_rank_reached: (ctx) => rankIndex(ctx.rank) >= rankIndex('silver'),
  gold_rank_reached: (ctx) => rankIndex(ctx.rank) >= rankIndex('gold'),
};

/** Returns the IDs of achievements that should newly unlock given the context. */
export function evaluateNewlyUnlocked(context: EvaluationContext, lockedAchievementIds: string[]): string[] {
  return lockedAchievementIds.filter((id) => evaluators[id]?.(context) ?? false);
}
