// screens/Settings.tsx
// Port of Views/Settings/SettingsView.swift.

import { useState } from 'react';
import type { AppSettings, UserProfile } from '../types';
import { db } from '../db/database';

export function Settings({ settings, profile }: { settings: AppSettings; profile: UserProfile }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const toggle = async (key: keyof AppSettings) => {
    await db.settings.update(settings.id, { [key]: !settings[key] });
  };

  const resetProgress = async () => {
    await db.sessions.clear();
    await db.setEntries.clear();
    await db.bodyMetrics.clear();
    const statBlock = await db.statBlocks.toCollection().first();
    if (statBlock) {
      await db.statBlocks.update(statBlock.id, {
        strengthLevel: 1, enduranceLevel: 1, agilityLevel: 1, disciplineLevel: 1, recoveryLevel: 1, vitalityLevel: 1,
        strengthXP: 0, enduranceXP: 0, agilityXP: 0, disciplineXP: 0, recoveryXP: 0, vitalityXP: 0,
        totalXP: 0, currentLevel: 1, currentRank: 'iron',
      });
    }
    await db.quests.clear();
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col gap-3 p-4 pb-24">
      <div className="text-xl font-bold tracking-wide text-text-primary mb-2">SETTINGS</div>

      <SettingRow label="Metric units" checked={settings.useMetricUnits} onToggle={() => toggle('useMetricUnits')} />
      <SettingRow label="Notifications" checked={settings.notificationsEnabled} onToggle={() => toggle('notificationsEnabled')} />
      <SettingRow label="Sound effects" checked={settings.soundEffectsEnabled} onToggle={() => toggle('soundEffectsEnabled')} />

      <div className="text-xs text-text-secondary mt-4">
        Profile: {profile.primaryGoal}, {profile.trainingDaysPerWeek} days/week
      </div>

      <button onClick={() => setShowConfirm(true)} className="mt-6 py-3 rounded-xl font-semibold text-accent-danger border border-accent-danger/40">
        Reset Progress
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="bg-bg-panel rounded-panel p-5 max-w-sm border border-white/10">
            <div className="text-base font-bold text-text-primary mb-2">Reset all progress?</div>
            <div className="text-sm text-text-secondary mb-4">
              This permanently deletes all workout history, XP, and levels. This cannot be undone.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm text-text-primary bg-white/10">
                Cancel
              </button>
              <button onClick={resetProgress} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-accent-danger">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center justify-between py-2.5 border-b border-white/5">
      <span className="text-sm text-text-primary">{label}</span>
      <div className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-accent-primary' : 'bg-white/15'}`}>
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </div>
    </button>
  );
}
