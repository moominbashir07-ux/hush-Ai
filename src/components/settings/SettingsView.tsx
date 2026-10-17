/**
 * Project HUSH - Settings View
 *
 * Configures general preferences, attention policy defaults,
 * sample data reset, and transparent system connection statuses in an obsidian theme.
 */

import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Eye,
  Check,
  Server,
  AlertTriangle,
} from 'lucide-react';
import type { AttentionPolicy, ImportanceLevel } from '../../types/index.ts';
import { Card } from '../ui/card.tsx';
import { Spotlight } from '../ui/spotlight.tsx';

interface SettingsViewProps {
  policy: AttentionPolicy;
  onPolicyChange: (policy: AttentionPolicy) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  policy,
  onPolicyChange,
  onResetAllData,
}) => {
  const [savedNotice, setSavedNotice] = useState(false);

  const handleUpdate = (updates: Partial<AttentionPolicy>) => {
    const updated = { ...policy, ...updates };
    onPolicyChange(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const importanceOptions: ImportanceLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

  return (
    <div className="flex-1 overflow-y-auto bg-black p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-neutral-300" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-400 font-semibold">
              PREFERENCES & RUNTIME
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-400 tracking-tight">
            System Settings
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Customize Attention Gate policies, UI density, and view service integrations.
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-mono">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preferences saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATTENTION POLICY CONFIG */}
        <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4 relative overflow-hidden group">
          <Spotlight fill="white" size={200} />
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
            <Sliders className="w-4 h-4 text-neutral-400" />
            <h2>Attention Policy Defaults</h2>
          </div>

          {/* Threshold Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="settings-threshold-input" className="text-neutral-300 font-medium">Confidence Threshold</label>
              <span className="font-mono text-white font-bold">
                {policy.confidenceThreshold.toFixed(2)} ({Math.round(policy.confidenceThreshold * 100)}%)
              </span>
            </div>
            <input
              id="settings-threshold-input"
              type="range"
              min="0.50"
              max="0.95"
              step="0.01"
              value={policy.confidenceThreshold}
              onChange={(e) =>
                handleUpdate({ confidenceThreshold: parseFloat(parseFloat(e.target.value).toFixed(2)) })
              }
              aria-label="Settings Confidence Threshold"
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <p className="text-[11px] text-neutral-500">
              Interventions below this decider confidence are silenced at the Attention Gate.
            </p>
          </div>

          {/* Minimum Importance */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Minimum Importance</span>
              <span className="font-mono text-neutral-200 font-bold">{policy.minimumImportance}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {importanceOptions.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleUpdate({ minimumImportance: lvl })}
                  className={`py-2 rounded-xl text-xs font-mono font-medium border transition ${
                    policy.minimumImportance === lvl
                      ? 'bg-neutral-100 text-black border-white font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-open inspector */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
            <div>
              <span className="font-medium text-neutral-200 block">
                Auto-Open Decision Inspector
              </span>
              <span className="text-[11px] text-neutral-500">
                Reveal the right-hand technical inspector on new decisions
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate({ autoOpenInspector: !policy.autoOpenInspector })}
              className={`w-11 h-6 rounded-full transition flex items-center p-1 ${
                policy.autoOpenInspector ? 'bg-neutral-200 justify-end' : 'bg-neutral-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-black shadow-sm" />
            </button>
          </div>
        </Card>

        {/* GENERAL PREFERENCES */}
        <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4 relative overflow-hidden group">
          <Spotlight fill="white" size={200} />
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
            <Eye className="w-4 h-4 text-neutral-400" />
            <h2>General & Display</h2>
          </div>

          {/* Density */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-neutral-200 block">Interface Density</span>
              <span className="text-[11px] text-neutral-500">Layout padding and line heights</span>
            </div>
            <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => handleUpdate({ density: 'comfortable' })}
                className={`px-3 py-1 rounded text-xs transition ${
                  policy.density === 'comfortable'
                    ? 'bg-neutral-100 text-black font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => handleUpdate({ density: 'compact' })}
                className={`px-3 py-1 rounded text-xs transition ${
                  policy.density === 'compact'
                    ? 'bg-neutral-100 text-black font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Compact
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
            <div>
              <span className="font-medium text-neutral-200 block">Reduced Motion</span>
              <span className="text-[11px] text-neutral-500">Limit 3D canvas and gyro animations</span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate({ reducedMotion: !policy.reducedMotion })}
              className={`w-11 h-6 rounded-full transition flex items-center p-1 ${
                policy.reducedMotion ? 'bg-neutral-200 justify-end' : 'bg-neutral-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-black shadow-sm" />
            </button>
          </div>

          {/* Sound Feedback */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
            <div>
              <span className="font-medium text-neutral-200 block">Acoustic Feedback</span>
              <span className="text-[11px] text-neutral-500">Subtle click upon gate allowance (default: off)</span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate({ soundEnabled: !policy.soundEnabled })}
              className={`w-11 h-6 rounded-full transition flex items-center p-1 ${
                policy.soundEnabled ? 'bg-neutral-200 justify-end' : 'bg-neutral-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-black shadow-sm" />
            </button>
          </div>

          {/* Reset Action */}
          <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
            <span className="text-xs text-neutral-500">Restore factory sample state:</span>
            <button
              type="button"
              onClick={onResetAllData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </Card>
      </div>

      {/* SYSTEM INTEGRATION STATUS */}
      <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
            <Server className="w-4 h-4 text-neutral-400" />
            <h2>System Integration Status</h2>
          </div>
          <span className="text-xs text-amber-400/90 font-mono flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            FRONTEND DEMONSTRATION PHASE
          </span>
        </div>

        <p className="text-xs text-neutral-500">
          In this frontend implementation phase, upstream inference systems run in local simulation mode. Real AWS Bedrock and remote Strands Decider 2B endpoints are not falsely claimed as live.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-neutral-300 font-semibold">Strands Decider 2B</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-300 font-bold">
                DEMO MODE
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">
              In-browser timing & intent logic
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-neutral-300 font-semibold">Amazon Bedrock</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400 font-bold">
                NOT CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">
              Claude 3.5 Sonnet payload ready
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-neutral-300 font-semibold">FastAPI Backend</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-400 font-bold">
                NOT CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-mono">
              Contract synchronized in TS
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
