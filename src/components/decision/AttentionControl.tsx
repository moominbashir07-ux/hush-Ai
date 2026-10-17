/**
 * Project HUSH - Interactive Attention Control
 *
 * Provides real-time sliders and selectors for:
 * 1. Confidence Threshold (0.50 to 0.95)
 * 2. Minimum Importance (LOW | MEDIUM | HIGH)
 */

import React from 'react';
import { Sliders, Shield, Zap, Sparkles } from 'lucide-react';
import type { AttentionPolicy, ImportanceLevel } from '../../types/index.ts';

interface AttentionControlProps {
  policy: AttentionPolicy;
  onPolicyChange: (newPolicy: AttentionPolicy) => void;
  compact?: boolean;
}

export const AttentionControl: React.FC<AttentionControlProps> = ({
  policy,
  onPolicyChange,
  compact = false,
}) => {
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onPolicyChange({
      ...policy,
      confidenceThreshold: parseFloat(val.toFixed(2)),
    });
  };

  const handleImportanceChange = (level: ImportanceLevel) => {
    onPolicyChange({
      ...policy,
      minimumImportance: level,
    });
  };

  const importanceLevels: ImportanceLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

  return (
    <div
      className={`rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-md p-4 space-y-4 ${
        compact ? 'p-3 space-y-3 text-xs' : 'text-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-200 font-medium">
          <Sliders className="w-4 h-4 text-neutral-400" />
          <span>Attention Gate Policy</span>
        </div>
        <span className="text-[11px] font-mono text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-750">
          LIVE FILTER
        </span>
      </div>

      {/* Threshold Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="confidence-threshold-input" className="text-neutral-300 font-medium flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-neutral-400" />
            Confidence Threshold
          </label>
          <span className="font-mono text-white font-semibold text-xs">
            {policy.confidenceThreshold.toFixed(2)} ({Math.round(policy.confidenceThreshold * 100)}%)
          </span>
        </div>

        <input
          id="confidence-threshold-input"
          type="range"
          min="0.50"
          max="0.95"
          step="0.01"
          value={policy.confidenceThreshold}
          onChange={handleThresholdChange}
          aria-label="Confidence Threshold"
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-neutral-200 transition"
        />

        <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
          <span>0.50 (Permissive)</span>
          <span>0.70 (Standard)</span>
          <span>0.95 (Strict)</span>
        </div>
      </div>

      {/* Minimum Importance Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-300 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-neutral-400" />
            Minimum Importance
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            Current: <strong className="text-neutral-200">{policy.minimumImportance}</strong>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {importanceLevels.map((lvl) => {
            const isSelected = policy.minimumImportance === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleImportanceChange(lvl)}
                aria-pressed={isSelected}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center ${
                  isSelected
                    ? 'bg-neutral-100 text-black border-white font-semibold shadow-xs'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-2 flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
        <span>
          Policy adjusts both real-time transcript evaluations and chat gate decisions.
        </span>
      </div>
    </div>
  );
};
