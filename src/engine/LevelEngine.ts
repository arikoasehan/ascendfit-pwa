// engine/LevelEngine.ts
// Direct port of Engine/LevelEngine.swift — same constants, same formulas.
// Pure functions, no I/O. See spec/04-formulas-algorithms.md §2-3.

import type { Rank } from '../types';

export const LevelEngineConstants = {
  baseXPPerStatLevel: 100,
  statLevelExponent: 1.5,
  characterLevelDivisor: 600,
} as const;

/** Cumulative XP required to reach a given stat level (level 1 = 0 XP baseline). */
export function cumulativeXPRequired(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let n = 1; n < level; n++) {
    total += LevelEngineConstants.baseXPPerStatLevel * Math.pow(n, LevelEngineConstants.statLevelExponent);
  }
  return total;
}

/** Given a stat's total accumulated XP, derive its current level. */
export function statLevel(xp: number): number {
  let level = 1;
  while (cumulativeXPRequired(level + 1) <= xp) {
    level += 1;
    if (level > 999) break; // safety bound
  }
  return level;
}

/** XP progress within the current level, and the amount needed for the next. */
export function progressWithinCurrentLevel(xp: number): { current: number; required: number } {
  const level = statLevel(xp);
  const lower = cumulativeXPRequired(level);
  const upper = cumulativeXPRequired(level + 1);
  return { current: xp - lower, required: upper - lower };
}

export function characterLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  const ratio = totalXP / LevelEngineConstants.characterLevelDivisor;
  return Math.max(1, Math.floor(Math.pow(ratio, 1 / LevelEngineConstants.statLevelExponent)) + 1);
}

export function rankForLevel(level: number): Rank {
  if (level < 10) return 'iron';
  if (level < 20) return 'bronze';
  if (level < 35) return 'silver';
  if (level < 50) return 'gold';
  if (level < 70) return 'platinum';
  if (level < 90) return 'diamond';
  return 'ascendant';
}

/** Total XP threshold needed to reach a given Character Level. */
export function totalXPRequired(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, LevelEngineConstants.statLevelExponent) * LevelEngineConstants.characterLevelDivisor;
}
