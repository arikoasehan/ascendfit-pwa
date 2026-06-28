// App.tsx
// Root component — port of RootView.swift + MainTabView.swift combined.
// Handles first-launch seeding, onboarding-vs-main routing, and tab nav.

import { useEffect, useState, useCallback } from 'react';
import { seedDatabaseIfNeeded } from './db/seed';
import { fetchOrGenerateDaily, fetchOrGenerateWeekly } from './db/questStore';
import { useProfile, useStatBlock, useExercises, useSessions, useAchievements, useSettings, useDailyQuests, useWeeklyQuests } from './hooks/useAppData';
import { Onboarding } from './screens/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { StatusPanel } from './screens/StatusPanel';
import { Directives } from './screens/Directives';
import { Workout } from './screens/Workout';
import { Achievements } from './screens/Achievements';
import { Settings } from './screens/Settings';
import { LevelUpOverlay } from './components/Shared';
import type { ApplyResult } from './engine/XPEngine';

type Tab = 'dashboard' | 'status' | 'quests' | 'achievements' | 'settings';

function todayKey(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function weekKey(): string {
  const d = new Date();
  const diff = d.getDate() - d.getDay();
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function App() {
  const [seeded, setSeeded] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [screen, setScreen] = useState<'main' | 'workout'>('main');
  const [levelUpInfo, setLevelUpInfo] = useState<ApplyResult | null>(null);

  const profile = useProfile();
  const statBlock = useStatBlock();
  const exercises = useExercises();
  const sessions = useSessions();
  const achievements = useAchievements();
  const settings = useSettings();
  const dailyQuests = useDailyQuests(todayKey());
  const weeklyQuests = useWeeklyQuests(weekKey());

  useEffect(() => {
    seedDatabaseIfNeeded().then(() => setSeeded(true));
  }, []);

  // Once a profile exists, ensure today's/this week's quests exist (idempotent — see questStore.ts).
  useEffect(() => {
    if (!profile) return;
    fetchOrGenerateDaily(profile, 1.0, true);
    fetchOrGenerateWeekly(profile, 0.8);
  }, [profile]);

  const streakDays = Math.min(sessions.length, 14);

  const handleLevelUp = useCallback((info: ApplyResult) => {
    if (info.characterLeveledUp || info.rankedUp) setLevelUpInfo(info);
  }, []);

  if (!seeded) {
    return <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">Loading...</div>;
  }

  if (!profile) {
    // onComplete is a no-op here on purpose: Onboarding writes the profile to
    // Dexie directly, and useProfile()'s live query re-renders App into the
    // main app automatically once that row exists — same self-healing
    // pattern as RootView.swift's @Query-driven routing.
    return <Onboarding onComplete={() => {}} />;
  }

  if (!statBlock || !settings) {
    return <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">Loading...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col relative">
      <style>{`
        @keyframes slideIn { from { transform: translateY(-12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="flex-1 overflow-y-auto">
        {screen === 'workout' && (
          <Workout
            exercises={exercises}
            statBlock={statBlock}
            streakDays={streakDays}
            onCancel={() => {
              setScreen('main');
              setTab('dashboard');
            }}
            onComplete={(applyResult) => handleLevelUp(applyResult)}
          />
        )}

        {screen === 'main' && tab === 'dashboard' && (
          <Dashboard statBlock={statBlock} quests={dailyQuests} onStartWorkout={() => setScreen('workout')} onLevelUp={handleLevelUp} />
        )}
        {screen === 'main' && tab === 'status' && <StatusPanel statBlock={statBlock} sessions={sessions} />}
        {screen === 'main' && tab === 'quests' && <Directives daily={dailyQuests} weekly={weeklyQuests} />}
        {screen === 'main' && tab === 'achievements' && <Achievements achievements={achievements} />}
        {screen === 'main' && tab === 'settings' && <Settings settings={settings} profile={profile} />}
      </div>

      {screen === 'main' && (
        <div className="flex border-t border-white/10">
          <TabButton active={tab === 'dashboard'} label="Home" icon="\u25A6" onClick={() => setTab('dashboard')} />
          <TabButton active={tab === 'status'} label="Stats" icon="\u2B21" onClick={() => setTab('status')} />
          <TabButton active={tab === 'quests'} label="Quests" icon="\u2611" onClick={() => setTab('quests')} />
          <TabButton active={tab === 'achievements'} label="Awards" icon="\u{1F3C6}" onClick={() => setTab('achievements')} />
          <TabButton active={tab === 'settings'} label="Settings" icon="\u2699" onClick={() => setTab('settings')} />
        </div>
      )}

      <LevelUpOverlay info={levelUpInfo} onDismiss={() => setLevelUpInfo(null)} />
    </div>
  );
}

function TabButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center gap-0.5 py-2.5">
      <span className={active ? 'text-accent-primary' : 'text-text-secondary'}>{icon}</span>
      <span className={`text-[10px] ${active ? 'text-accent-primary' : 'text-text-secondary'}`}>{label}</span>
    </button>
  );
}
