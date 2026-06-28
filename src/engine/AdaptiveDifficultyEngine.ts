// engine/AdaptiveDifficultyEngine.ts
// Direct port of Engine/AdaptiveDifficultyEngine.swift.
// See spec/04-formulas-algorithms.md §4 for derivation and worked examples.

import type { FitnessGoal } from '../types';

export const AdaptiveConstants = {
  wCompletionRate: 0.28,
  wPerformanceDelta: 0.2,
  wRPEAlignment: 0.15,
  wStreakHealth: 0.12,
  wMissedSessions: -0.15,
  wRPETrendPenalty: -0.1,
  wRecoveryTrend: 0.1,
  weightAlignmentBonusMax: 0.1,
  scoreToMultiplierScale: 0.25,
  multiplierFloor: 0.85,
  multiplierCeiling: 1.25,
  volumeAdjustmentScale: 15,
  intensityAdjustmentScale: 10,
} as const;

export interface WeeklySignals {
  completionRate: number; // 0-1
  averageRPE: number;
  targetRPE: number;
  rpeTrend: number; // -1 to +1
  performanceDelta: number; // -1 to +1
  streakDays: number;
  targetStreakDays: number;
  missedSessionsCount: number;
  plannedSessionsCount: number;
  recoveryStatTrend: number; // -1 to +1
  weightChangeKGPerWeek: number;
  primaryGoal: FitnessGoal;
}

export interface AdaptiveResult {
  adaptiveScore: number;
  difficultyMultiplier: number;
  volumeAdjustmentPercent: number;
  intensityAdjustmentPercent: number;
  explanation: string;
  nutritionNudgeTriggered: boolean;
}

function weightAlignmentBonus(goal: FitnessGoal, weeklyChangeKG: number): number {
  switch (goal) {
    case 'fatLoss':
      if (weeklyChangeKG <= -0.2) return AdaptiveConstants.weightAlignmentBonusMax;
      if (weeklyChangeKG < 0) return AdaptiveConstants.weightAlignmentBonusMax * 0.4;
      return -AdaptiveConstants.weightAlignmentBonusMax;
    case 'muscleGain':
      if (weeklyChangeKG >= 0.1) return AdaptiveConstants.weightAlignmentBonusMax;
      if (weeklyChangeKG > 0) return AdaptiveConstants.weightAlignmentBonusMax * 0.4;
      return -AdaptiveConstants.weightAlignmentBonusMax;
    case 'strength':
    case 'endurance':
    case 'generalHealth':
      return 0;
  }
}

function buildExplanation(score: number, completionRate: number, missedSessionsCount: number, nutritionNudge: boolean): string {
  const parts: string[] = [];
  if (score > 0.3) {
    parts.push(`Strong adherence (${Math.round(completionRate * 100)}% completion) and improving performance pushed load up this week.`);
  } else if (score < -0.3) {
    parts.push('Lower completion and/or rising fatigue signals eased next week\u2019s load to keep training sustainable.');
  } else {
    parts.push('Performance held steady, so next week\u2019s load stays close to baseline.');
  }
  if (missedSessionsCount > 0) {
    parts.push(`${missedSessionsCount} session(s) were missed this week.`);
  }
  if (nutritionNudge) {
    parts.push('Progress toward your weight goal has stalled despite good training adherence \u2014 consider a nutrition adjustment rather than a training one.');
  }
  return parts.join(' ');
}

export function computeWeeklyAdjustment(signals: WeeklySignals): AdaptiveResult {
  const streakHealth = signals.targetStreakDays > 0 ? Math.min(signals.streakDays / signals.targetStreakDays, 1) : 0;
  const missedNormalized =
    signals.plannedSessionsCount > 0 ? Math.min(signals.missedSessionsCount / signals.plannedSessionsCount, 1) : 0;
  const rpeDeviation = Math.min(Math.abs(signals.averageRPE - signals.targetRPE) / 5, 1);
  const weightBonus = weightAlignmentBonus(signals.primaryGoal, signals.weightChangeKGPerWeek);

  let raw = 0;
  raw += AdaptiveConstants.wCompletionRate * signals.completionRate;
  raw += AdaptiveConstants.wPerformanceDelta * signals.performanceDelta;
  raw += AdaptiveConstants.wRPEAlignment * (1 - rpeDeviation);
  raw += AdaptiveConstants.wStreakHealth * streakHealth;
  raw += AdaptiveConstants.wMissedSessions * missedNormalized;
  raw += AdaptiveConstants.wRPETrendPenalty * Math.max(0, signals.rpeTrend);
  raw += AdaptiveConstants.wRecoveryTrend * signals.recoveryStatTrend;
  raw += weightBonus;

  const adaptiveScore = Math.max(-1, Math.min(1, raw));
  const rawMultiplier = 1 + adaptiveScore * AdaptiveConstants.scoreToMultiplierScale;
  const difficultyMultiplier = Math.max(AdaptiveConstants.multiplierFloor, Math.min(AdaptiveConstants.multiplierCeiling, rawMultiplier));
  const volumeAdjustmentPercent = adaptiveScore * AdaptiveConstants.volumeAdjustmentScale;
  const intensityAdjustmentPercent = adaptiveScore * AdaptiveConstants.intensityAdjustmentScale;
  const nutritionNudgeTriggered = weightBonus < 0 && signals.completionRate >= 0.75;

  return {
    adaptiveScore,
    difficultyMultiplier,
    volumeAdjustmentPercent,
    intensityAdjustmentPercent,
    nutritionNudgeTriggered,
    explanation: buildExplanation(adaptiveScore, signals.completionRate, signals.missedSessionsCount, nutritionNudgeTriggered),
  };
}
