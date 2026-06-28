// db/database.ts
// IndexedDB persistence via Dexie — the web equivalent of AscendFit's
// SwiftData ModelContainer. Same entities as Models/*.swift, adapted to
// Dexie's table/index conventions. This is what makes the PWA's progress
// survive a refresh, unlike the in-chat artifact version.

import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  StatBlock,
  ExerciseDefinition,
  WorkoutSession,
  SetEntry,
  Quest,
  Achievement,
  BodyMetricEntry,
  AppSettings,
} from '../types';

export class AscendFitDB extends Dexie {
  profiles!: EntityTable<UserProfile, 'id'>;
  statBlocks!: EntityTable<StatBlock, 'id'>;
  exercises!: EntityTable<ExerciseDefinition, 'id'>;
  sessions!: EntityTable<WorkoutSession, 'id'>;
  setEntries!: EntityTable<SetEntry, 'id'>;
  quests!: EntityTable<Quest, 'id'>;
  achievements!: EntityTable<Achievement, 'id'>;
  bodyMetrics!: EntityTable<BodyMetricEntry, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('ascendfit-db');
    this.version(1).stores({
      profiles: 'id, createdAt',
      statBlocks: 'id',
      exercises: 'id, category',
      sessions: 'id, date',
      setEntries: 'id, sessionId, exerciseId',
      quests: 'id, scopeDate, type, isComplete',
      achievements: 'id, isUnlocked',
      bodyMetrics: 'id, date',
      settings: 'id',
    });
  }
}

export const db = new AscendFitDB();
