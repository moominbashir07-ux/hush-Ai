/**
 * Project HUSH - Decision Inspector Panel
 *
 * Exposes the internal attention gate decision fields,
 * breakdown of the four conditions, latency, Bedrock call status,
 * and decision history in an obsidian dark aesthetic.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  History,
  Activity,
  ChevronDown,
  ChevronUp,
  Cpu,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { DecisionResult, AttentionPolicy } from '../../types/index.ts';
import { formatActionLabel, getActionColor } from '../../lib/attentionGate.ts';
import { AttentionControl } from './AttentionControl.tsx';

interface DecisionInspectorProps {
  decision: DecisionResult | null;
  history: DecisionResult[];
  policy: AttentionPolicy;
  onPolicyChange: (policy: AttentionPolicy) => void;
  onSelectHistoricalDecision: (dec: DecisionResult) => void;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const DecisionInspector: React.FC<DecisionInspectorProps> = ({
  decision,
  history,
  policy,
  onPolicyChange,
  onSelectHistoricalDecision,
  onClose,
  isMobileDrawer = false,
}) => {
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(true);

  if (!decision) {
    return (
      <aside
        className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-black border-l border-neutral-800/80 p-6 text-neutral-400"
        aria-label="Decision Inspector"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neutral-300" />
              Decision Inspector
            </h2>
            <p className="text-xs text-neutral-500">Why Hush speaks or stays silent.</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900"
              aria-label="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/40">
          <Activity className="w-8 h-8 text-neutral-600 mb-3" />
          <p className="text-sm font-medium text-neutral-300">Awaiting Utterance</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs">
            Send a message or select a test scenario to inspect Strands Decider 2B logits and gate evaluations.
          </p>
        </div>
      </aside>
    );
  }

  const actionColors = getActionColor(decision.action);
  const confidencePercent = Math.round(decision.confidence * 100);

  return (
    <aside
      className={`w-full md:w-80 lg:w-[380px] flex flex-col h-full bg-black/[0.98] border-l border-neutral-800/80 overflow-y-auto text-neutral-300 select-text ${
        isMobileDrawer ? 'border-none p-4' : 'p-5'
      }`}
      aria-label="Decision Inspector"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neutral-200" />
            <h2 className="text-sm font-semibold tracking-wide text-neutral-100 uppercase">
              Decision Inspector
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">Why Hush speaks or stays silent.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700/80 text-neutral-300">
            DEMO MODE
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-900"
              aria-label="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* SECTION A: SELECTED ACTION */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-neutral-400">
              Section A: Selected Action
            </span>
            <span className="font-mono text-[11px] text-neutral-500">{decision.timestamp}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide border shadow-xs ${actionColors.bg} ${actionColors.text} ${actionColors.border}`}
            >
              {formatActionLabel(decision.action)}
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              Action ID: <code className="text-neutral-300">{decision.action}</code>
            </span>
          </div>
        </div>

        {/* SECTION B: DECIDER CONFIDENCE */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-neutral-400">
              Section B: Decider Confidence
            </span>
            <span className="font-mono text-xs font-bold text-neutral-100">
              {decision.confidence.toFixed(2)} ({confidencePercent}%)
            </span>
          </div>

          {/* Confidence Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  decision.confidence >= decision.confidence_threshold
                    ? 'bg-gradient-to-r from-neutral-300 to-white'
                    : 'bg-rose-500/70'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, confidencePercent))}%` }}
              />
              {/* Threshold indicator line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                style={{ left: `${decision.confidence_threshold * 100}%` }}
                title={`Threshold: ${(decision.confidence_threshold * 100).toFixed(0)}%`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>0.00</span>
              <span className="text-amber-400/90">
                Threshold: {(decision.confidence_threshold * 100).toFixed(0)}%
              </span>
              <span>1.00</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            Raw softmax confidence from Strands Decider 2B intent head.
          </p>
        </div>

        {/* SECTION C: CONVERSATIONAL STATE */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-neutral-400">
              Section C: Conversational State
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-500 block text-[11px]">Mid-Thought</span>
              <span
                className={`font-mono font-bold mt-0.5 inline-block ${
                  decision.is_mid_thought ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {decision.is_mid_thought ? 'YES (Explaining)' : 'NO (Concluded)'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-900/70 border border-neutral-800/80">
              <span className="text-neutral-500 block text-[11px]">Importance</span>
              <span className="font-mono font-bold mt-0.5 inline-block text-neutral-200">
                {decision.importance}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION D: ATTENTION GATE */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3.5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-neutral-400">
              Section D: Attention Gate
            </span>
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 ${
                decision.gate_allowed
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
              }`}
            >
              {decision.gate_allowed ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" /> SPEAK
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" /> STAY SILENT
                </>
              )}
            </span>
          </div>

          {/* Checklist */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2 p-2 rounded bg-neutral-900/60 border border-neutral-800/60">
              {decision.gate_breakdown.actionNotSilent.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="text-neutral-200">1. Action is not STAY SILENT</span>
                {!decision.gate_breakdown.actionNotSilent.passed && (
                  <p className="text-[11px] text-rose-300 mt-0.5">
                    {decision.gate_breakdown.actionNotSilent.failureReason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded bg-neutral-900/60 border border-neutral-800/60">
              {decision.gate_breakdown.confidenceMet.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="text-neutral-200">
                  2. Confidence meets threshold ({Math.round(decision.confidence_threshold * 100)}%)
                </span>
                {!decision.gate_breakdown.confidenceMet.passed && (
                  <p className="text-[11px] text-rose-300 mt-0.5">
                    {decision.gate_breakdown.confidenceMet.failureReason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded bg-neutral-900/60 border border-neutral-800/60">
              {decision.gate_breakdown.notMidThought.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="text-neutral-200">3. Speaker is not mid-thought</span>
                {!decision.gate_breakdown.notMidThought.passed && (
                  <p className="text-[11px] text-rose-300 mt-0.5">
                    {decision.gate_breakdown.notMidThought.failureReason}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 p-2 rounded bg-neutral-900/60 border border-neutral-800/60">
              {decision.gate_breakdown.importanceMet.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="text-neutral-200">
                  4. Importance meets minimum ({decision.minimum_importance})
                </span>
                {!decision.gate_breakdown.importanceMet.passed && (
                  <p className="text-[11px] text-rose-300 mt-0.5">
                    {decision.gate_breakdown.importanceMet.failureReason}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div
            className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
              decision.gate_allowed
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
            }`}
          >
            <strong>Gate Outcome:</strong> {decision.gate_reason}
          </div>
        </div>

        {/* SECTION E: EXECUTION DETAILS */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider font-semibold text-[11px] text-neutral-400">
              Section E: Execution Details
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-500">Decision Latency</span>
              <span className="text-neutral-200 font-semibold">{decision.decision_latency_ms} ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-500">Bedrock Called</span>
              <span
                className={
                  decision.bedrock_called
                    ? 'text-emerald-400 font-bold'
                    : 'text-neutral-500'
                }
              >
                {decision.bedrock_called ? 'YES (Generated)' : 'NO (Avoided)'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/60">
              <span className="text-neutral-500">Target Model</span>
              <span className="text-neutral-300">Claude 3.5 Sonnet (Bedrock)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-neutral-500">Execution Mode</span>
              <span className="text-neutral-300">{decision.execution_mode}</span>
            </div>
          </div>
        </div>

        {/* LIVE ATTENTION POLICY TUNER */}
        <div>
          <button
            type="button"
            onClick={() => setControlsExpanded(!controlsExpanded)}
            className="w-full flex items-center justify-between text-xs font-medium text-neutral-300 py-1.5 hover:text-white transition"
          >
            <span>Live Attention Policy Tuner</span>
            {controlsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {controlsExpanded && (
            <div className="mt-2">
              <AttentionControl policy={policy} onPolicyChange={onPolicyChange} compact />
            </div>
          )}
        </div>

        {/* SECTION F: DECISION HISTORY */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-3.5 space-y-2">
          <button
            type="button"
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-neutral-200 transition"
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-neutral-400" />
              Section F: Decision History ({history.length})
            </span>
            {historyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {historyExpanded && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-neutral-500 py-2 text-center">No decisions recorded yet.</p>
              ) : (
                history.map((hist) => {
                  const isCurrent = hist.id === decision.id;
                  const colors = getActionColor(hist.action);
                  return (
                    <button
                      key={hist.id}
                      type="button"
                      onClick={() => onSelectHistoricalDecision(hist)}
                      className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition flex items-center justify-between ${
                        isCurrent
                          ? 'bg-neutral-900 border-neutral-600 text-neutral-100'
                          : 'bg-neutral-950/60 border-neutral-850 text-neutral-300 hover:bg-neutral-900'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded mr-1.5 font-bold ${colors.bg} ${colors.text}`}>
                          {hist.action.replace('_', ' ')}
                        </span>
                        <span className="text-neutral-500 text-[11px] truncate">
                          {hist.user_utterance_snippet ?? 'Utterance'}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-bold ${
                            hist.gate_allowed ? 'text-emerald-400' : 'text-neutral-500'
                          }`}
                        >
                          {hist.gate_allowed ? 'SPEAK' : 'SILENT'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
