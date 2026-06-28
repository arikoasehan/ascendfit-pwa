// screens/Onboarding.tsx
// Port of Views/Onboarding/OnboardingFlowView.swift — same step structure,
// trimmed slightly (no body-fat/limitations steps) to match the artifact
// scope baseline; full fields (age, equipment, limitations) are still in
// UserProfile if you want to extend the form later.

import { useState } from 'react';
import { db } from '../db/database';
import type { ActivityLevel, EquipmentType, FitnessExperience, FitnessGoal, UserProfile, StatBlock } from '../types';

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'light', label: 'Lightly Active' },
  { id: 'moderate', label: 'Moderately Active' },
  { id: 'active', label: 'Active' },
  { id: 'veryActive', label: 'Very Active' },
];
const GOALS: { id: FitnessGoal; label: string }[] = [
  { id: 'fatLoss', label: 'Fat Loss' },
  { id: 'muscleGain', label: 'Muscle Gain' },
  { id: 'strength', label: 'Strength' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'generalHealth', label: 'General Health' },
];
const EQUIPMENT: { id: EquipmentType; label: string }[] = [
  { id: 'none', label: 'Bodyweight Only' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'barbellRack', label: 'Barbell + Rack' },
  { id: 'fullGym', label: 'Full Gym' },
  { id: 'cardioMachine', label: 'Cardio Machine' },
];

interface FormState {
  age: number;
  heightCM: number;
  weightKG: number;
  activityLevel: ActivityLevel;
  fitnessExperience: FitnessExperience;
  primaryGoal: FitnessGoal;
  trainingDaysPerWeek: number;
  sessionLengthMinutes: number;
  equipmentAccess: EquipmentType[];
}

export function Onboarding({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    age: 28,
    heightCM: 175,
    weightKG: 75,
    activityLevel: 'moderate',
    fitnessExperience: 'new',
    primaryGoal: 'generalHealth',
    trainingDaysPerWeek: 4,
    sessionLengthMinutes: 45,
    equipmentAccess: ['dumbbells'],
  });
  const totalSteps = 4;

  const toggleEquipment = (id: EquipmentType) => {
    setForm((f) => ({
      ...f,
      equipmentAccess: f.equipmentAccess.includes(id) ? f.equipmentAccess.filter((e) => e !== id) : [...f.equipmentAccess, id],
    }));
  };

  const finish = async () => {
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      age: form.age,
      activityLevel: form.activityLevel,
      fitnessExperience: form.fitnessExperience,
      limitations: [],
      primaryGoal: form.primaryGoal,
      trainingDaysPerWeek: form.trainingDaysPerWeek,
      sessionLengthMinutes: form.sessionLengthMinutes,
      equipmentAccess: form.equipmentAccess,
      heightCM: form.heightCM,
      weightKG: form.weightKG,
      createdAt: new Date().toISOString(),
    };
    const statBlock: StatBlock = {
      id: crypto.randomUUID(),
      strengthLevel: 1, enduranceLevel: 1, agilityLevel: 1, disciplineLevel: 1, recoveryLevel: 1, vitalityLevel: 1,
      strengthXP: 0, enduranceXP: 0, agilityXP: 0, disciplineXP: 0, recoveryXP: 0, vitalityXP: 0,
      totalXP: 0, currentLevel: 1, currentRank: 'iron',
    };
    await db.profiles.add(profile);
    await db.statBlocks.add(statBlock);
    await db.bodyMetrics.add({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weightKG: form.weightKG,
      source: 'manual',
    });
    onComplete(profile);
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex justify-center gap-1.5 pt-6 pb-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= step ? 'bg-accent-primary' : 'bg-white/15'}`} />
        ))}
      </div>

      <div className="flex-1 px-5 flex flex-col">
        {step === 0 && (
          <Step title="STATE YOUR BASE">
            <Field label="Age">
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                className="bg-transparent text-right font-mono w-16 outline-none text-text-primary"
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number"
                value={form.heightCM}
                onChange={(e) => setForm({ ...form, heightCM: Number(e.target.value) })}
                className="bg-transparent text-right font-mono w-16 outline-none text-text-primary"
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                value={form.weightKG}
                onChange={(e) => setForm({ ...form, weightKG: Number(e.target.value) })}
                className="bg-transparent text-right font-mono w-16 outline-none text-text-primary"
              />
            </Field>
          </Step>
        )}

        {step === 1 && (
          <Step title="ACTIVITY LEVEL">
            {ACTIVITY_LEVELS.map((a) => (
              <SelectRow key={a.id} label={a.label} selected={form.activityLevel === a.id} onClick={() => setForm({ ...form, activityLevel: a.id })} />
            ))}
          </Step>
        )}

        {step === 2 && (
          <Step title="PRIMARY GOAL">
            {GOALS.map((g) => (
              <SelectRow key={g.id} label={g.label} selected={form.primaryGoal === g.id} onClick={() => setForm({ ...form, primaryGoal: g.id })} />
            ))}
          </Step>
        )}

        {step === 3 && (
          <Step title="AVAILABILITY & EQUIPMENT">
            <div className="mb-1 text-text-primary text-sm">Training days/week: {form.trainingDaysPerWeek}</div>
            <input
              type="range" min={1} max={7} value={form.trainingDaysPerWeek}
              onChange={(e) => setForm({ ...form, trainingDaysPerWeek: Number(e.target.value) })}
            />
            <div className="mb-1 mt-3 text-text-primary text-sm">Session length: {form.sessionLengthMinutes} min</div>
            <input
              type="range" min={15} max={90} step={5} value={form.sessionLengthMinutes}
              onChange={(e) => setForm({ ...form, sessionLengthMinutes: Number(e.target.value) })}
            />
            <div className="text-[11px] mt-4 mb-2 text-text-secondary">EQUIPMENT ACCESS</div>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((eq) => {
                const selected = form.equipmentAccess.includes(eq.id);
                return (
                  <button
                    key={eq.id}
                    onClick={() => toggleEquipment(eq.id)}
                    className={`px-3 py-1.5 rounded-full text-xs ${selected ? 'bg-accent-primary text-bg-void' : 'bg-white/10 text-text-primary'}`}
                  >
                    {eq.label}
                  </button>
                );
              })}
            </div>
          </Step>
        )}

        <div className="flex-1" />

        <button
          onClick={() => (step < totalSteps - 1 ? setStep(step + 1) : finish())}
          className="mb-8 py-3.5 rounded-2xl font-semibold text-center bg-accent-primary text-bg-void"
        >
          {step === totalSteps - 1 ? 'ENTER ASCENDFIT' : 'CONTINUE \u2192'}
        </button>
      </div>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="text-xl font-bold tracking-wide text-text-primary">{title}</div>
      <div className="relative rounded-panel p-4 border border-accent-primary/25 bg-bg-panel/55">
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

function SelectRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left w-full ${selected ? 'bg-accent-primary/15' : ''}`}
    >
      <span className="text-sm text-text-primary">{label}</span>
      {selected && <span className="text-accent-primary">\u2713</span>}
    </button>
  );
}
