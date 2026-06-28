// hooks/useAppData.ts
// Central data-access hook layer, the web equivalent of AscendFit's
// ViewModels — wraps Dexie's live queries so components re-render
// automatically when underlying IndexedDB data changes.

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useProfile() {
  return useLiveQuery(() => db.profiles.toCollection().first(), []);
}

export function useStatBlock() {
  return useLiveQuery(() => db.statBlocks.toCollection().first(), []);
}

export function useExercises() {
  return useLiveQuery(() => db.exercises.toArray(), []) ?? [];
}

export function useSessions() {
  return useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray(), []) ?? [];
}

export function useAchievements() {
  return useLiveQuery(() => db.achievements.toArray(), []) ?? [];
}

export function useBodyMetrics() {
  return useLiveQuery(() => db.bodyMetrics.orderBy('date').reverse().toArray(), []) ?? [];
}

export function useSettings() {
  return useLiveQuery(() => db.settings.toCollection().first(), []);
}

export function useDailyQuests(scopeDate: string) {
  return useLiveQuery(() => db.quests.where({ scopeDate, type: 'daily' }).toArray(), [scopeDate]) ?? [];
}

export function useWeeklyQuests(scopeDate: string) {
  return useLiveQuery(() => db.quests.where({ scopeDate, type: 'weekly' }).toArray(), [scopeDate]) ?? [];
}
