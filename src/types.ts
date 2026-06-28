// types.ts
// Mirrors AscendFit's Swift Models/Enums.swift — same vocabulary, same shape,
// so the Engine layer logic ported in engine/ behaves identically.

export const STAT_TYPES = ['strength', 'endurance', 'agility', 'discipline', 'recovery', 'vitality'] as const;
export type StatType = (typeof STAT_TYPES)[number];

export type StatWeightProfile = Partial<Record<StatType, number>>;

export const RANKS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'ascendant'] as const;
export type Rank = (typeof RANKS)[number];
export const rankIndex = (r: Rank): number => RANKS.indexOf(r);

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export const ACTIVITY_STEP_BASELINE: Record<ActivityLevel, number> = {
  sedentary: 5000,
  light: 7000,
  moderate: 8000,
  active: 10000,
  veryActive: 12000,
};

export type FitnessExperience = 'new' | 'returning' | 'intermediate' | 'advanced';
export type FitnessGoal = 'fatLoss' | 'muscleGain' | 'strength' | 'endurance' | 'generalHealth';
export type EquipmentType = 'none' | 'dumbbells' | 'barbellRack' | 'fullGym' | 'resistanceBands' | 'cardioMachine';
export type ExerciseCategory = 'strength' | 'bodyweight' | 'mobility' | 'cardio' | 'hiit' | 'walking';
export type QuestType = 'daily' | 'weekly';
export type QuestCategory = 'steps' | 'workout' | 'hydration' | 'sleep' | 'mobility' | 'weightChange' | 'distance' | 'custom';
export type MetricSource = 'manual' | 'healthKit';

export interface UserProfile {
  id: string;
  age: number;
  activityLevel: ActivityLevel;
  fitnessExperience: FitnessExperience;
  limitations: string[];
  primaryGoal: FitnessGoal;
  trainingDaysPerWeek: number;
  sessionLengthMinutes: number;
  equipmentAccess: EquipmentType[];
  heightCM: number;
  weightKG: number;
  bodyFatPercent?: number;
  createdAt: string;
}

export interface StatBlock {
  id: string;
  strengthLevel: number;
  enduranceLevel: number;
  agilityLevel: number;
  disciplineLevel: number;
  recoveryLevel: number;
  vitalityLevel: number;
  strengthXP: number;
  enduranceXP: number;
  agilityXP: number;
  disciplineXP: number;
  recoveryXP: number;
  vitalityXP: number;
  totalXP: number;
  currentLevel: number;
  currentRank: Rank;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscleGroups: string[];
  equipmentRequired: EquipmentType[];
  statWeights: StatWeightProfile;
  difficultyTier: number;
  instructions: string;
  contraindicatedFor: string[];
}

export interface SetEntry {
  id: string;
  sessionId: string;
  exerciseId: string;
  setIndex: number;
  reps: number;
  weightKG?: number;
  durationSeconds?: number;
  rpe?: number;
  isPR: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  title: string;
  durationSeconds: number;
  averageRPE?: number;
  totalVolumeKG: number;
  xpAwarded: number;
  statXPBreakdown: StatWeightProfile;
}

export interface Quest {
  id: string;
  title: string;
  type: QuestType;
  category: QuestCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  xpReward: number;
  scopeDate: string; // ISO date (day-level for daily, week-start for weekly)
  isComplete: boolean;
  completedAt?: string;
  sourceIsManualOnly: boolean; // true = user taps "mark complete"; false = numeric progress entry
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isHidden: boolean;
  unlockCondition: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface BodyMetricEntry {
  id: string;
  date: string;
  weightKG?: number;
  bodyFatPercent?: number;
  waistCM?: number;
  chestCM?: number;
  source: MetricSource;
}

export interface AppSettings {
  id: string;
  useMetricUnits: boolean;
  notificationsEnabled: boolean;
  soundEffectsEnabled: boolean;
  lastAdaptiveRecalcDate?: string;
}
