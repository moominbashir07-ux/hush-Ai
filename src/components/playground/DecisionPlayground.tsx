/**
 * Project HUSH - Decision Playground
 *
 * Interactive testing lab for Hackathon judges with Spotlight cards,
 * dual 3D visuals (Spline Scene & Three.js Neural Orb), and real-time Attention Gate.
 */

import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Shield,
  Volume2,
  VolumeX,
  FileText,
  Sliders,
  Boxes,
} from 'lucide-react';
import type {
  PlaygroundScenario,
  AttentionPolicy,
  DecisionAction,
  ImportanceLevel,
  DecisionResult,
} from '../../types/index.ts';
import { evaluateAttentionGate, formatActionLabel, getActionColor } from '../../lib/attentionGate.ts';
import { ThreeNeuralOrb } from '../ui/ThreeNeuralOrb.tsx';
import { SplineScene } from '../ui/splite.tsx';
import { Card } from '../ui/card.tsx';
import { Spotlight } from '../ui/spotlight.tsx';

interface DecisionPlaygroundProps {
  scenarios: PlaygroundScenario[];
  policy: AttentionPolicy;
  onPolicyChange: (policy: AttentionPolicy) => void;
  onSelectDecision: (dec: DecisionResult) => void;
}

export const DecisionPlayground: React.FC<DecisionPlaygroundProps> = ({
  scenarios,
  policy,
  onPolicyChange,
  onSelectDecision,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const currentScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenarioId) ?? scenarios[0],
    [scenarios, selectedScenarioId]
  );

  // Editable local state
  const [customTranscript, setCustomTranscript] = useState(currentScenario.transcript);
  const [activeAction, setActiveAction] = useState<DecisionAction>(currentScenario.baseDecision.action);
  const [activeConfidence, setActiveConfidence] = useState<number>(currentScenario.baseDecision.confidence);
  const [activeMidThought, setActiveMidThought] = useState<boolean>(currentScenario.baseDecision.is_mid_thought);
  const [activeImportance, setActiveImportance] = useState<ImportanceLevel>(currentScenario.baseDecision.importance);
  const [active3DMode, setActive3DMode] = useState<'spline' | 'three'>('spline');

  const handleSelectScenario = (scenario: PlaygroundScenario) => {
    setSelectedScenarioId(scenario.id);
    setCustomTranscript(scenario.transcript);
    setActiveAction(scenario.baseDecision.action);
    setActiveConfidence(scenario.baseDecision.confidence);
    setActiveMidThought(scenario.baseDecision.is_mid_thought);
    setActiveImportance(scenario.baseDecision.importance);
  };

  const handleResetDefaults = () => {
    handleSelectScenario(currentScenario);
    onPolicyChange({
      ...policy,
      confidenceThreshold: 0.70,
      minimumImportance: 'MEDIUM',
    });
  };

  const computedDecision: DecisionResult = useMemo(() => {
    return evaluateAttentionGate({
      id: `play-${selectedScenarioId}`,
      action: activeAction,
      confidence: activeConfidence,
      is_mid_thought: activeMidThought,
      importance: activeImportance,
      confidence_threshold: policy.confidenceThreshold,
      minimum_importance: policy.minimumImportance,
      decision_latency_ms: 19,
      user_utterance_snippet: customTranscript.slice(0, 80),
      proposedResponse: currentScenario.baseDecision.proposedResponse,
    });
  }, [
    selectedScenarioId,
    activeAction,
    activeConfidence,
    activeMidThought,
    activeImportance,
    policy.confidenceThreshold,
    policy.minimumImportance,
    customTranscript,
    currentScenario.baseDecision.proposedResponse,
  ]);

  const actionOptions: DecisionAction[] = [
    'STAY_SILENT',
    'CORRECT_FACT',
    'ANSWER_QUESTION',
    'FLAG_ACTION_ITEM',
    'SUGGEST_RESOURCE',
  ];

  const importanceOptions: ImportanceLevel[] = ['LOW', 'MEDIUM', 'HIGH'];

  return (
    <div className="flex-1 overflow-y-auto bg-black p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-neutral-200" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-400 font-semibold">
              HACKATHON EVALUATION LAB
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700/80 text-neutral-300">
              SAMPLE DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-400 tracking-tight">
            Decision Playground
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Simulate conversational turns, tweak policy thresholds, and observe how the Attention Gate controls whether to invoke the model.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Scenario Selector Pills */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
          Select Conversational Scenario ({scenarios.length} scenarios)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
          {scenarios.map((scen, idx) => {
            const isSelected = scen.id === selectedScenarioId;
            return (
              <button
                key={scen.id}
                type="button"
                onClick={() => handleSelectScenario(scen)}
                className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-400 text-white shadow-md'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                <span className="text-[10px] font-mono text-neutral-500 mb-1">
                  Scenario 0{idx + 1}
                </span>
                <span className="font-semibold text-neutral-200 line-clamp-1">{scen.title}</span>
                <span className="text-[10px] font-mono mt-1 text-neutral-400">
                  {scen.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4 relative overflow-hidden group">
            <Spotlight fill="white" size={220} />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-neutral-400" />
                Transcript & Context
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Speaker: <strong className="text-neutral-300">{currentScenario.speakerRole}</strong>
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-neutral-500">Conversational Utterance</label>
              <textarea
                value={customTranscript}
                onChange={(e) => setCustomTranscript(e.target.value)}
                rows={4}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs sm:text-sm text-neutral-200 focus:outline-hidden focus:border-neutral-500 font-sans"
              />
            </div>

            {/* Simulated Decider Output */}
            <div className="border-t border-neutral-800 pt-3 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block">
                Strands Decider 2B Logits (Simulated)
              </span>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-500">Selected Action Head</label>
                <select
                  value={activeAction}
                  onChange={(e) => setActiveAction(e.target.value as DecisionAction)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-neutral-200 focus:outline-hidden focus:border-neutral-500"
                >
                  {actionOptions.map((act) => (
                    <option key={act} value={act}>
                      {formatActionLabel(act)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="text-[11px] text-neutral-500">Decider Confidence</label>
                  <span className="font-mono text-white font-semibold text-xs">
                    {(activeConfidence * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.40"
                  max="0.99"
                  step="0.01"
                  value={activeConfidence}
                  onChange={(e) => setActiveConfidence(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <div>
                  <span className="text-xs text-neutral-200 font-medium block">
                    Mid-Thought Detected
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Speaker is currently pausing / explaining
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMidThought(!activeMidThought)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
                    activeMidThought
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {activeMidThought ? 'YES' : 'NO'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-500">Utterance Importance</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {importanceOptions.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setActiveImportance(lvl)}
                      className={`py-1.5 rounded text-xs font-mono font-semibold border transition ${
                        activeImportance === lvl
                          ? 'bg-neutral-100 text-black border-white'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* CENTER COLUMN: 3D Visual & Outcome */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <Card className="p-5 bg-black/[0.96] border border-neutral-800 flex-1 flex flex-col items-center justify-between relative overflow-hidden group">
            <Spotlight fill="white" size={260} />
            <div className="w-full flex items-center justify-between border-b border-neutral-800/80 pb-2">
              <span className="text-xs font-mono uppercase text-neutral-400">3D Neural Presence</span>
              <div className="flex gap-1 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setActive3DMode('spline')}
                  className={`px-2 py-0.5 rounded border transition ${
                    active3DMode === 'spline' ? 'bg-neutral-100 text-black border-white' : 'text-neutral-400 border-neutral-800'
                  }`}
                >
                  Spline
                </button>
                <button
                  type="button"
                  onClick={() => setActive3DMode('three')}
                  className={`px-2 py-0.5 rounded border transition ${
                    active3DMode === 'three' ? 'bg-neutral-100 text-black border-white' : 'text-neutral-400 border-neutral-800'
                  }`}
                >
                  Three.js
                </button>
              </div>
            </div>

            {/* 3D Visual */}
            <div className="w-full h-56 my-2 relative flex items-center justify-center">
              {active3DMode === 'spline' ? (
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full"
                />
              ) : (
                <ThreeNeuralOrb
                  state={computedDecision.gate_allowed ? 'speaking' : 'silent'}
                  size="normal"
                />
              )}
            </div>

            {/* Outcome Display */}
            <div className="w-full text-center space-y-3 border-t border-neutral-800/80 pt-4">
              <div className="text-xs uppercase font-mono tracking-wider text-neutral-500">
                ATTENTION GATE OUTCOME
              </div>

              <div
                className={`py-3 px-4 rounded-xl text-lg font-mono font-bold flex items-center justify-center gap-2 border shadow-lg ${
                  computedDecision.gate_allowed
                    ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 shadow-emerald-950/30'
                    : 'bg-rose-950/70 border-rose-600 text-rose-300 shadow-rose-950/30'
                }`}
              >
                {computedDecision.gate_allowed ? (
                  <>
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                    <span>ALLOWED TO SPEAK</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-5 h-5 text-rose-400" />
                    <span>STAY SILENT (BLOCKED)</span>
                  </>
                )}
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed px-2">
                {computedDecision.gate_reason}
              </p>

              {computedDecision.gate_allowed && currentScenario.baseDecision.proposedResponse && (
                <div className="mt-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-left text-xs text-neutral-300">
                  <span className="font-semibold text-neutral-200 block mb-1">
                    Generated Model Response (Bedrock):
                  </span>
                  <p className="text-neutral-400">{currentScenario.baseDecision.proposedResponse}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4 relative overflow-hidden group">
            <Spotlight fill="white" size={200} />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-neutral-400" />
              Gate Policy Configuration
            </span>

            {/* Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium">Policy Threshold</span>
                <span className="font-mono text-white font-bold">
                  {policy.confidenceThreshold.toFixed(2)} (
                  {Math.round(policy.confidenceThreshold * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={policy.confidenceThreshold}
                onChange={(e) =>
                  onPolicyChange({
                    ...policy,
                    confidenceThreshold: parseFloat(parseFloat(e.target.value).toFixed(2)),
                  })
                }
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0.50 (Loose)</span>
                <span>0.70 (Standard)</span>
                <span>0.95 (Strict)</span>
              </div>
            </div>

            {/* Minimum Importance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium">Policy Minimum Importance</span>
                <span className="font-mono text-neutral-200 font-bold">{policy.minimumImportance}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {importanceOptions.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      onPolicyChange({
                        ...policy,
                        minimumImportance: lvl,
                      })
                    }
                    className={`py-1 rounded text-xs font-medium border transition ${
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
          </Card>

          {/* Condition Breakdown */}
          <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Condition Verification
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                {computedDecision.gate_breakdown.actionNotSilent.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium text-neutral-200">1. Action != STAY SILENT</span>
                  <p className="text-[11px] text-neutral-500">
                    Current action: <strong>{formatActionLabel(computedDecision.action)}</strong>
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                {computedDecision.gate_breakdown.confidenceMet.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium text-neutral-200">
                    2. Confidence &gt;= {(policy.confidenceThreshold * 100).toFixed(0)}%
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Decider score: <strong>{(computedDecision.confidence * 100).toFixed(0)}%</strong>
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                {computedDecision.gate_breakdown.notMidThought.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium text-neutral-200">3. Not Mid-Thought</span>
                  <p className="text-[11px] text-neutral-500">
                    Status: <strong>{computedDecision.is_mid_thought ? 'Explaining (Hold)' : 'Concluded (Ready)'}</strong>
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                {computedDecision.gate_breakdown.importanceMet.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium text-neutral-200">
                    4. Importance &gt;= {policy.minimumImportance}
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Utterance level: <strong>{computedDecision.importance}</strong>
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectDecision(computedDecision)}
              className="w-full mt-2 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 transition flex items-center justify-center gap-1.5"
            >
              <span>Load into Global Inspector</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};
