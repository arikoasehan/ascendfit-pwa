// engine/QuestGenerator.ts
// Direct port of Engine/QuestGenerator.swift. See spec/04-formulas-algorithms.md §5.

import { ACTIVITY_STEP_BASELINE, type Quest, type UserProfile } from '../types';

export const QuestConstants = {
  hydrationTargetLiters: 2.5,
  sleepTargetHours: 7,
  stretchTargetMinutes: 10,
  baseStepXP: 25,
  baseHydrationXP: 15,
  baseSleepXP: 20,
  baseStretchXP: 15,
  workoutCompletionXP: 40,
} as const;

function makeId(): string {
  return crypto.randomUUID();
}

export function generateDailyDirectives(
  profile: UserProfile,
  difficultyMultiplier: number,
  hasScheduledWorkoutToday: boolean,
  scopeDate: string
): Quest[] {
  const stepTarget = Math.round(ACTIVITY_STEP_BASELINE[profile.activityLevel] * difficultyMultiplier);

  const quests: Quest[] = [
    {
      id: makeId(),
      title: `Walk ${stepTarget.toLocaleString()} steps`,
      type: 'daily',
      category: 'steps',
      targetValue: stepTarget,
      currentValue: 0,
      unit: 'steps',
      xpReward: QuestConstants.baseStepXP,
      scopeDate,
      isComplete: false,
      sourceIsManualOnly: false,
    },
    {
      id: makeId(),
      title: `Drink ${QuestConstants.hydrationTargetLiters}L water`,
      type: 'daily',
      category: 'hydration',
      targetValue: QuestConstants.hydrationTargetLiters,
      currentValue: 0,
      unit: 'L',
      xpReward: QuestConstants.baseHydrationXP,
      scopeDate,
      isComplete: false,
      sourceIsManualOnly: true,
    },
    {
      id: makeId(),
      title: `Sleep ${QuestConstants.sleepTargetHours}+ hours`,
      type: 'daily',
      category: 'sleep',
      targetValue: QuestConstants.sleepTargetHours,
      currentValue: 0,
      unit: 'hours',
      xpReward: QuestConstants.baseSleepXP,
      scopeDate,
      isComplete: false,
      sourceIsManualOnly: true,
    },
  ];

  if (hasScheduledWorkoutToday) {
    quests.push({
      id: makeId(),
      title: "Complete today's workout",
      type: 'daily',
      category: 'workout',
      targetValue: 1,
      currentValue: 0,
      unit: 'sessions',
      xpReward: QuestConstants.workoutCompletionXP,
      scopeDate,
      isComplete: false,
      sourceIsManualOnly: false,
    });
  }

  quests.push({
    id: makeId(),
    title: `Stretch for ${QuestConstants.stretchTargetMinutes} minutes`,
    type: 'daily',
    category: 'mobility',
    targetValue: QuestConstants.stretchTargetMinutes,
    currentValue: 0,
    unit: 'minutes',
    xpReward: QuestConstants.baseStretchXP,
    scopeDate,
    isComplete: false,
    sourceIsManualOnly: true,
  });

  return quests;
}

export function generateWeeklyCampaigns(profile: UserProfile, lastWeekCompletionRate: number, weekStartDate: string): Quest[] {
  const workoutTarget = lastWeekCompletionRate < 0.5 ? Math.max(2, profile.trainingDaysPerWeek - 1) : profile.trainingDaysPerWeek;

  const quests: Quest[] = [
    {
      id: makeId(),
      title: `Complete ${workoutTarget} workouts`,
      type: 'weekly',
      category: 'workout',
      targetValue: workoutTarget,
      currentValue: 0,
      unit: 'sessions',
      xpReward: 80,
      scopeDate: weekStartDate,
      isComplete: false,
      sourceIsManualOnly: false,
    },
    {
      id: makeId(),
      title: `Reach ${(ACTIVITY_STEP_BASELINE[profile.activityLevel] * 7).toLocaleString()} weekly steps`,
      type: 'weekly',
      category: 'steps',
      targetValue: ACTIVITY_STEP_BASELINE[profile.activityLevel] * 7,
      currentValue: 0,
      unit: 'steps',
      xpReward: 60,
      scopeDate: weekStartDate,
      isComplete: false,
      sourceIsManualOnly: false,
    },
    goalConditionalCampaign(profile, weekStartDate),
  ];

  return quests;
}

function goalConditionalCampaign(profile: UserProfile, weekStartDate: string): Quest {
  const base = {
    id: makeId(),
    type: 'weekly' as const,
    currentValue: 0,
    xpReward: 70,
    scopeDate: weekStartDate,
    isComplete: false,
    sourceIsManualOnly: true,
  };
  switch (profile.primaryGoal) {
    case 'fatLoss':
      return { ...base, title: 'Trend down 0.2\u20130.5kg this week', category: 'weightChange', targetValue: 0.2, unit: 'kg' };
    case 'muscleGain':
      return { ...base, title: 'Log a new estimated 1RM', category: 'custom', targetValue: 1, unit: 'PR' };
    case 'strength':
      return { ...base, title: 'Set a new PR on any tracked lift', category: 'custom', targetValue: 1, unit: 'PR' };
    case 'endurance':
      return { ...base, title: 'Improve pace or distance vs. last week', category: 'distance', targetValue: 1, unit: 'improvement' };
    case 'generalHealth':
      return { ...base, title: '5 of 7 days with all Directives complete', category: 'custom', targetValue: 5, unit: 'days' };
  }
}
