// components/Shared.tsx
// Ports of Views/Shared/*.swift — same visual language (HoloPanel glass
// panels, NeonProgressBar, LevelUpOverlay, QuestPopup), now as React components.

import { useEffect } from 'react';
import type { Quest } from '../types';
import type { ApplyResult } from '../engine/XPEngine';

export function HoloPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-panel p-4 border border-accent-primary/25 ${className}`}
      style={{
        background: 'rgba(14,16,24,0.55)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 24px rgba(61,231,255,0.06)',
      }}
    >
      {children}
    </div>
  );
}

export function NeonProgressBar({ progress, height = 14 }: { progress: number; height?: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="w-full rounded-full overflow-hidden bg-white/5" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-accent-primary to-accent-secondary"
        style={{ width: `${pct}%`, boxShadow: '0 0 8px rgba(61,231,255,0.6)' }}
      />
    </div>
  );
}

export function QuestPopup({ quest, onDone }: { quest: Quest | null; onDone: () => void }) {
  useEffect(() => {
    if (!quest) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [quest, onDone]);

  if (!quest) return null;
  return (
    <div className="fixed top-3 left-3 right-3 z-40" style={{ animation: 'slideIn 0.3s ease-out' }}>
      <HoloPanel>
        <div className="flex items-center gap-3">
          <span className="text-lg text-accent-success">\u2713</span>
          <div className="flex-1">
            <div className="text-[10px] tracking-wide text-text-secondary">DIRECTIVE COMPLETE</div>
            <div className="text-sm text-text-primary">{quest.title}</div>
          </div>
          <div className="font-mono font-bold text-accent-primary">+{Math.round(quest.xpReward)} XP</div>
        </div>
      </HoloPanel>
    </div>
  );
}

export function LevelUpOverlay({ info, onDismiss }: { info: ApplyResult | null; onDismiss: () => void }) {
  if (!info) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="flex flex-col items-center gap-4 px-8 text-center" style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-gradient-to-r from-accent-primary to-accent-secondary"
          style={{ boxShadow: '0 0 40px rgba(61,231,255,0.4)' }}
        >
          {info.rankedUp ? '\u25C6' : '\u25B2'}
        </div>
        <div className="text-2xl font-bold tracking-wider text-text-primary">{info.rankedUp ? 'RANK UP' : 'LEVEL UP'}</div>
        {info.rankedUp && <div className="text-lg font-mono font-bold uppercase text-accent-secondary">{info.newRank}</div>}
        <div className="text-base font-mono text-text-secondary">Level {info.newCharacterLevel}</div>
        <button onClick={onDismiss} className="mt-2 px-6 py-2 rounded-full font-semibold text-sm bg-accent-primary text-bg-void">
          CONTINUE
        </button>
      </div>
    </div>
  );
}
