// db/questStore.ts
// Single source of truth for fetching-or-generating today's Directives and
// this week's Campaigns. Mirrors Engine/QuestStore.swift — same fix for the
// same risk: if Dashboard and Directives screens both call a naive
// "fetch, if empty then generate" independently, you can get duplicate
// Quest rows for the same day. Routing both through here avoids that.

import { db } from './database';
import { generateDailyDirectives, generateWeeklyCampaigns } from '../engine/QuestGenerator';
import type { Quest, UserProfile } from '../types';

function startOfDayISO(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD, stable string key
}

function startOfWeekISO(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = d.getDate() - day;
  d.setDate(diff);
  return startOfDayISO(d);
}

export async function fetchOrGenerateDaily(
  profile: UserProfile,
  difficultyMultiplier: number,
  hasScheduledWorkoutToday: boolean,
  forDate: Date = new Date()
): Promise<Quest[]> {
  const scopeDate = startOfDayISO(forDate);
  const existing = await db.quests.where({ scopeDate, type: 'daily' }).toArray();
  if (existing.length > 0) return existing;

  const generated = generateDailyDirectives(profile, difficultyMultiplier, hasScheduledWorkoutToday, scopeDate);
  await db.quests.bulkAdd(generated);
  return generated;
}

export async function fetchOrGenerateWeekly(
  profile: UserProfile,
  lastWeekCompletionRate: number,
  forDate: Date = new Date()
): Promise<Quest[]> {
  const scopeDate = startOfWeekISO(forDate);
  const existing = await db.quests.where({ scopeDate, type: 'weekly' }).toArray();
  if (existing.length > 0) return existing;

  const generated = generateWeeklyCampaigns(profile, lastWeekCompletionRate, scopeDate);
  await db.quests.bulkAdd(generated);
  return generated;
}

export async function updateQuestProgress(questId: string, newValue: number): Promise<boolean> {
  const quest = await db.quests.get(questId);
  if (!quest) return false;
  const willComplete = !quest.isComplete && newValue >= quest.targetValue;
  await db.quests.update(questId, {
    currentValue: newValue,
    isComplete: quest.isComplete || willComplete,
    completedAt: willComplete ? new Date().toISOString() : quest.completedAt,
  });
  return willComplete;
}
