// engine/XPEngine.ts
// Direct port of Engine/XPEngine.swift. See spec/04-formulas-algorithms.md §1.

import { STAT_TYPES, type StatType, type StatWeightProfile, type StatBlock, rankIndex } from '../types';
import { statLevel, characterLevel, rankForLevel } from './LevelEngine';

export const XPEngineConstants = {
  xpPerMinute: 2.2,
  xpPerVolumeKG: 0.04,
  xpPerAverageRPE: 8,
  prBonusXP: 15,
  streakBonusCapDays: 14,
  streakBonusPerDay: 0.01,
} as const;

export interface SessionXPInput {
  durationMinutes: number;
  totalVolumeKG: number;
  averageRPE: number;
  difficultyMultiplier: number; // from AdaptiveDifficultyEngine, 0.85-1.25
  currentStreakDays: number;
  setStatContributions: StatWeightProfile[]; // one entry per logged set, pre-weighted by exercise
  prCount: number;
  prDominantStat: StatType;
}

export interface SessionXPResult {
  totalXP: number;
  statBreakdown: StatWeightProfile;
  baseXP: number;
  consistencyMultiplier: number;
}

export function computeSessionXP(input: SessionXPInput): SessionXPResult {
  const baseXP =
    input.durationMinutes * XPEngineConstants.xpPerMinute +
    input.totalVolumeKG * XPEngineConstants.xpPerVolumeKG +
    input.averageRPE * XPEngineConstants.xpPerAverageRPE;

  const consistencyMultiplier =
    1 + Math.min(input.currentStreakDays, XPEngineConstants.streakBonusCapDays) * XPEngineConstants.streakBonusPerDay;

  const sessionXP = baseXP * input.difficultyMultiplier * consistencyMultiplier;

  const totalWeights: StatWeightProfile = {};
  STAT_TYPES.forEach((s) => (totalWeights[s] = 0));
  input.setStatContributions.forEach((profile) => {
    STAT_TYPES.forEach((s) => {
      totalWeights[s] = (totalWeights[s] ?? 0) + (profile[s] ?? 0);
    });
  });
  const weightSum = STAT_TYPES.reduce((acc, s) => acc + (totalWeights[s] ?? 0), 0);

  const breakdown: StatWeightProfile = {};
  if (weightSum > 0) {
    STAT_TYPES.forEach((s) => {
      breakdown[s] = sessionXP * ((totalWeights[s] ?? 0) / weightSum);
    });
  } else {
    const even = sessionXP / STAT_TYPES.length;
    STAT_TYPES.forEach((s) => (breakdown[s] = even));
  }

  const prBonus = input.prCount * XPEngineConstants.prBonusXP;
  breakdown[input.prDominantStat] = (breakdown[input.prDominantStat] ?? 0) + prBonus;

  return {
    totalXP: sessionXP + prBonus,
    statBreakdown: breakdown,
    baseXP,
    consistencyMultiplier,
  };
}

export interface ApplyResult {
  next: StatBlock;
  statsLeveledUp: StatType[];
  characterLeveledUp: boolean;
  rankedUp: boolean;
  previousCharacterLevel: number;
  newCharacterLevel: number;
  previousRank: StatBlock['currentRank'];
  newRank: StatBlock['currentRank'];
}

/** Applies a SessionXPResult to a StatBlock, returning a new StatBlock (immutable) plus level-up metadata. */
export function applySessionXP(result: SessionXPResult, statBlock: StatBlock): ApplyResult {
  const statsLeveledUp: StatType[] = [];
  const updatedFields: Partial<StatBlock> = {};

  STAT_TYPES.forEach((stat) => {
    const prevLevel = statBlockLevel(statBlock, stat);
    const newXP = statBlockXP(statBlock, stat) + (result.statBreakdown[stat] ?? 0);
    const newLevel = statLevel(newXP);
    setStatBlockXP(updatedFields, stat, newXP);
    setStatBlockLevel(updatedFields, stat, newLevel);
    if (newLevel > prevLevel) statsLeveledUp.push(stat);
  });

  const previousCharacterLevel = statBlock.currentLevel;
  const previousRank = statBlock.currentRank;
  const newTotalXP = statBlock.totalXP + result.totalXP;
  const newCharacterLevel = characterLevel(newTotalXP);
  const newRank = rankForLevel(newCharacterLevel);

  const next: StatBlock = {
    ...statBlock,
    ...updatedFields,
    totalXP: newTotalXP,
    currentLevel: newCharacterLevel,
    currentRank: newRank,
  };

  return {
    next,
    statsLeveledUp,
    characterLeveledUp: newCharacterLevel > previousCharacterLevel,
    rankedUp: rankIndex(newRank) > rankIndex(previousRank),
    previousCharacterLevel,
    newCharacterLevel,
    previousRank,
    newRank,
  };
}

// Typed accessors avoid `as any` template-literal-key indexing while still
// letting STAT_TYPES.forEach drive all six stats from one code path.
function statBlockXP(block: StatBlock, stat: StatType): number {
  switch (stat) {
    case 'strength': return block.strengthXP;
    case 'endurance': return block.enduranceXP;
    case 'agility': return block.agilityXP;
    case 'discipline': return block.disciplineXP;
    case 'recovery': return block.recoveryXP;
    case 'vitality': return block.vitalityXP;
  }
}

function statBlockLevel(block: StatBlock, stat: StatType): number {
  switch (stat) {
    case 'strength': return block.strengthLevel;
    case 'endurance': return block.enduranceLevel;
    case 'agility': return block.agilityLevel;
    case 'discipline': return block.disciplineLevel;
    case 'recovery': return block.recoveryLevel;
    case 'vitality': return block.vitalityLevel;
  }
}

function setStatBlockXP(fields: Partial<StatBlock>, stat: StatType, value: number): void {
  switch (stat) {
    case 'strength': fields.strengthXP = value; break;
    case 'endurance': fields.enduranceXP = value; break;
    case 'agility': fields.agilityXP = value; break;
    case 'discipline': fields.disciplineXP = value; break;
    case 'recovery': fields.recoveryXP = value; break;
    case 'vitality': fields.vitalityXP = value; break;
  }
}

function setStatBlockLevel(fields: Partial<StatBlock>, stat: StatType, value: number): void {
  switch (stat) {
    case 'strength': fields.strengthLevel = value; break;
    case 'endurance': fields.enduranceLevel = value; break;
    case 'agility': fields.agilityLevel = value; break;
    case 'discipline': fields.disciplineLevel = value; break;
    case 'recovery': fields.recoveryLevel = value; break;
    case 'vitality': fields.vitalityLevel = value; break;
  }
}
