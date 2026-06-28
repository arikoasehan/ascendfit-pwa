// db/seed.ts
// First-launch seeding — mirrors AscendFitApp.swift's seedExerciseDatabaseIfNeeded()
// and seedAchievementsIfNeeded(), idempotent (checks count before inserting).

import { db } from './database';
import { EXERCISE_SEED } from './exerciseSeed';
import { ACHIEVEMENT_SEED } from './achievementSeed';

export async function seedDatabaseIfNeeded(): Promise<void> {
  const exerciseCount = await db.exercises.count();
  if (exerciseCount === 0) {
    await db.exercises.bulkAdd(EXERCISE_SEED);
  }

  const achievementCount = await db.achievements.count();
  if (achievementCount === 0) {
    await db.achievements.bulkAdd(
      ACHIEVEMENT_SEED.map((a) => ({ ...a, isUnlocked: false, unlockedAt: undefined }))
    );
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'app-settings',
      useMetricUnits: true,
      notificationsEnabled: true,
      soundEffectsEnabled: true,
    });
  }
}
