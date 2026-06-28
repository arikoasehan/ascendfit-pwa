// screens/Workout.tsx
// Port of Views/Workout/WorkoutListView.swift + ActiveWorkoutView.swift +
// SetLoggerView.swift, combined into one flow component since the web
// version doesn't need separate navigation pushes for this.

import { useState } from 'react';
import { db } from '../db/database';
import { computeSessionXP, applySessionXP, type ApplyResult } from '../engine/XPEngine';
import type { ExerciseDefinition, StatBlock, StatType, StatWeightProfile } from '../types';
import { STAT_TYPES } from '../types';
import { HoloPanel, NeonProgressBar } from '../components/Shared';

interface LoggedSet {
  exerciseId: string;
  reps: number;
  weightKG: number;
  rpe: number;
  isPR: boolean;
}

const TARGET_SETS = 3;

export function Workout({
  exercises,
  statBlock,
  streakDays,
  onCancel,
  onComplete,
}: {
  exercises: ExerciseDefinition[];
  statBlock: StatBlock;
  streakDays: number;
  onCancel: () => void;
  onComplete: (applyResult: ApplyResult, xpResult: ReturnType<typeof computeSessionXP>) => void;
}) {
  const planExercises = exercises.slice(0, 5); // simple fixed-length session for the web MVP
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [weight, setWeight] = useState(40);
  const [reps, setReps] = useState(8);
  const [rpe, setRpe] = useState(7);
  const [isPR, setIsPR] = useState(false);
  const [startTime] = useState(Date.now());
  const [summary, setSummary] = useState<{ xpResult: ReturnType<typeof computeSessionXP> } | null>(null);

  const exercise = planExercises[exerciseIndex];
  const done = exerciseIndex >= planExercises.length;

  const logSet = () => {
    setLoggedSets((prev) => [...prev, { exerciseId: exercise.id, reps, weightKG: weight, rpe, isPR }]);
    setIsPR(false);
    if (setNumber >= TARGET_SETS) {
      setSetNumber(1);
      setExerciseIndex((i) => i + 1);
    } else {
      setSetNumber((n) => n + 1);
    }
  };

  const finish = async () => {
    const durationMinutes = Math.max(1, (Date.now() - startTime) / 60000);
    const totalVolumeKG = loggedSets.reduce((acc, s) => acc + s.weightKG * s.reps, 0);
    const avgRPE = loggedSets.length ? loggedSets.reduce((a, s) => a + s.rpe, 0) / loggedSets.length : 6;
    const setStatContributions: StatWeightProfile[] = loggedSets.map((s) => {
      const def = planExercises.find((e) => e.id === s.exerciseId);
      return def?.statWeights ?? {};
    });
    const prCount = loggedSets.filter((s) => s.isPR).length;
    const dominantStat: StatType = 'strength';

    const xpResult = computeSessionXP({
      durationMinutes,
      totalVolumeKG,
      averageRPE: avgRPE,
      difficultyMultiplier: 1.0,
      currentStreakDays: streakDays,
      setStatContributions,
      prCount,
      prDominantStat: dominantStat,
    });

    const sessionId = crypto.randomUUID();
    await db.sessions.add({
      id: sessionId,
      date: new Date().toISOString(),
      title: 'Workout',
      durationSeconds: Math.round(durationMinutes * 60),
      averageRPE: avgRPE,
      totalVolumeKG,
      xpAwarded: xpResult.totalXP,
      statXPBreakdown: xpResult.statBreakdown,
    });
    await db.setEntries.bulkAdd(
      loggedSets.map((s, i) => ({
        id: crypto.randomUUID(),
        sessionId,
        exerciseId: s.exerciseId,
        setIndex: i + 1,
        reps: s.reps,
        weightKG: s.weightKG,
        rpe: s.rpe,
        isPR: s.isPR,
      }))
    );

    const applyResult = applySessionXP(xpResult, statBlock);
    await db.statBlocks.update(statBlock.id, applyResult.next);

    setSummary({ xpResult });
    onComplete(applyResult, xpResult);
  };

  if (summary) {
    return (
      <div className="flex flex-col gap-4 p-4 h-full items-center justify-center text-center">
        <div className="text-4xl text-accent-success">\u25C6</div>
        <div className="text-xl font-bold tracking-wide text-text-primary">SESSION SAVED</div>
        <HoloPanel className="w-full max-w-sm">
          <div className="text-xs mb-2 text-text-secondary">XP BREAKDOWN</div>
          <div className="flex flex-col gap-1.5">
            {STAT_TYPES.filter((s) => (summary.xpResult.statBreakdown[s] ?? 0) > 0.5).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <span className="text-sm text-text-primary">{s[0].toUpperCase() + s.slice(1)}</span>
                <span className="font-mono text-accent-primary">+{Math.round(summary.xpResult.statBreakdown[s] ?? 0)} XP</span>
              </div>
            ))}
          </div>
          <div className="h-px my-2 bg-white/10" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Total</span>
            <span className="font-mono font-bold text-accent-secondary">+{Math.round(summary.xpResult.totalXP)} XP</span>
          </div>
        </HoloPanel>
        <button onClick={onCancel} className="px-8 py-3 rounded-2xl font-semibold bg-accent-primary text-bg-void">
          DONE
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 p-4 h-full items-center justify-center text-center">
        <div className="text-4xl text-accent-success">\u2713</div>
        <div className="text-xl font-bold tracking-wide text-text-primary">ALL EXERCISES LOGGED</div>
        <div className="text-sm text-text-secondary">{loggedSets.length} sets recorded</div>
        <button onClick={finish} className="mt-4 px-8 py-3 rounded-2xl font-semibold bg-accent-primary text-bg-void">
          FINISH SESSION
        </button>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-sm text-text-secondary">No exercises available. Add some in your exercise database.</div>
        <button onClick={onCancel} className="mt-4 text-sm text-accent-primary">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-text-primary">WORKOUT</span>
        <span className="text-xs text-text-secondary">
          Set {setNumber}/{TARGET_SETS}
        </span>
      </div>
      <NeonProgressBar progress={exerciseIndex / planExercises.length} height={6} />

      <HoloPanel>
        <div className="text-lg font-bold mb-1 text-text-primary">{exercise.name}</div>
        <div className="text-xs mb-4 text-text-secondary">{exercise.instructions}</div>

        <SliderField label="Weight (kg)" value={weight} setValue={setWeight} min={0} max={200} step={2.5} />
        <SliderField label="Reps" value={reps} setValue={setReps} min={1} max={30} step={1} />
        <SliderField label="RPE" value={rpe} setValue={setRpe} min={4} max={10} step={0.5} />

        <label className="flex items-center gap-2 mt-3 mb-4">
          <input type="checkbox" checked={isPR} onChange={(e) => setIsPR(e.target.checked)} />
          <span className="text-sm text-text-primary">New PR this set</span>
        </label>

        <button onClick={logSet} className="w-full py-3 rounded-xl font-semibold bg-accent-primary text-bg-void">
          LOG SET
        </button>
      </HoloPanel>

      <button onClick={onCancel} className="text-sm text-center text-accent-danger">
        End Workout Early
      </button>
    </div>
  );
}

function SliderField({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="font-mono font-bold text-text-primary">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(Number(e.target.value))} />
    </div>
  );
}
