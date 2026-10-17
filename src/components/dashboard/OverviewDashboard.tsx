/**
 * Project HUSH - Overview Dashboard
 *
 * Visualizes attention gate throughput, avoided Bedrock calls,
 * decision distributions across the five actions, and recent evaluations
 * with Spotlight hover cards in an obsidian theme.
 */

import React from 'react';
import {
  MessageSquare,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { DecisionResult } from '../../types/index.ts';
import { formatActionLabel, getActionColor } from '../../lib/attentionGate.ts';
import { Card } from '../ui/card.tsx';
import { Spotlight } from '../ui/spotlight.tsx';

interface OverviewDashboardProps {
  recentDecisions: DecisionResult[];
  onSelectDecision: (dec: DecisionResult) => void;
  onOpenPlayground: () => void;
  onOpenChat: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  recentDecisions,
  onSelectDecision,
  onOpenPlayground,
  onOpenChat,
}) => {
  const evaluatedCount = 1482;
  const bedrockCount = 528;
  const avoidedCount = evaluatedCount - bedrockCount; // 954
  const avoidedRate = ((avoidedCount / evaluatedCount) * 100).toFixed(1);
  const medianLatency = '21 ms';

  // Action distribution breakdown
  const actionDistribution = [
    { action: 'STAY_SILENT', count: 642, percent: 43.3, color: 'bg-neutral-600' },
    { action: 'ANSWER_QUESTION', count: 488, percent: 32.9, color: 'bg-emerald-500' },
    { action: 'FLAG_ACTION_ITEM', count: 164, percent: 11.1, color: 'bg-purple-500' },
    { action: 'CORRECT_FACT', count: 112, percent: 7.6, color: 'bg-amber-500' },
    { action: 'SUGGEST_RESOURCE', count: 76, percent: 5.1, color: 'bg-cyan-500' },
  ];

  // Timeline bins
  const timelineData = [
    { hour: '09:00', speaking: 18, silent: 42 },
    { hour: '11:00', speaking: 34, silent: 58 },
    { hour: '13:00', speaking: 22, silent: 38 },
    { hour: '15:00', speaking: 45, silent: 72 },
    { hour: '17:00', speaking: 28, silent: 64 },
    { hour: '19:00', speaking: 14, silent: 30 },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-black p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-neutral-300" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-400 font-semibold">
              SYSTEM MONITOR
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700/80 text-neutral-300">
              SAMPLE DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-400 tracking-tight">
            Attention Overview
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Your AI copilot, with control over when it speaks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenPlayground}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-100 hover:bg-white text-black shadow-md flex items-center gap-2 transition"
          >
            <span>Decision Playground</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 transition"
          >
            Launch Chat
          </button>
        </div>
      </div>

      {/* 4 Metric Cards with Spotlight Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="p-4 sm:p-5 bg-black/[0.96] border border-neutral-800 hover:border-neutral-700 transition relative overflow-hidden group">
          <Spotlight fill="white" size={200} />
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-medium">Utterances Evaluated</span>
            <MessageSquare className="w-4 h-4 text-neutral-500 group-hover:text-neutral-200 transition" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">
            {evaluatedCount.toLocaleString()}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Passes through Decider 2B
          </p>
          <span className="absolute top-2 right-2 text-[9px] font-mono text-neutral-600">SAMPLE</span>
        </Card>

        {/* Metric 2 */}
        <Card className="p-4 sm:p-5 bg-black/[0.96] border border-neutral-800 hover:border-neutral-700 transition relative overflow-hidden group">
          <Spotlight fill="white" size={200} />
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-medium">Bedrock Calls</span>
            <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300">
            {bedrockCount.toLocaleString()}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Only when Gate allowed ({((bedrockCount / evaluatedCount) * 100).toFixed(1)}%)
          </p>
          <span className="absolute top-2 right-2 text-[9px] font-mono text-neutral-600">SAMPLE</span>
        </Card>

        {/* Metric 3 */}
        <Card className="p-4 sm:p-5 bg-black/[0.96] border border-neutral-800 hover:border-neutral-700 transition relative overflow-hidden group">
          <Spotlight fill="white" size={200} />
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-medium">Calls Avoided</span>
            <ShieldCheck className="w-4 h-4 text-neutral-300 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-100">
            {avoidedCount.toLocaleString()} <span className="text-sm font-normal text-neutral-400">({avoidedRate}%)</span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Silence preserved & spend avoided
          </p>
          <span className="absolute top-2 right-2 text-[9px] font-mono text-neutral-600">SAMPLE</span>
        </Card>

        {/* Metric 4 */}
        <Card className="p-4 sm:p-5 bg-black/[0.96] border border-neutral-800 hover:border-neutral-700 transition relative overflow-hidden group">
          <Spotlight fill="white" size={200} />
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span className="font-medium">Median Decision Latency</span>
            <Clock className="w-4 h-4 text-neutral-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-200">
            {medianLatency}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Strands 2B local edge inference
          </p>
          <span className="absolute top-2 right-2 text-[9px] font-mono text-neutral-600">SAMPLE</span>
        </Card>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Distribution Chart */}
        <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">
                Action Distribution
              </h2>
              <p className="text-xs text-neutral-500">Classified across 5 conversational intent heads</p>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">N=1,482</span>
          </div>

          {/* Stacked Bar */}
          <div className="h-4 w-full bg-neutral-900 rounded-full overflow-hidden flex border border-neutral-800">
            {actionDistribution.map((item) => (
              <div
                key={item.action}
                className={`${item.color} h-full transition-all`}
                style={{ width: `${item.percent}%` }}
                title={`${formatActionLabel(item.action as any)}: ${item.percent}%`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2">
            {actionDistribution.map((item) => (
              <div key={item.action} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-xs ${item.color}`} />
                  <span className="text-neutral-300 font-medium font-mono text-[11px]">
                    {formatActionLabel(item.action as any)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
                  <span>{item.count} items</span>
                  <span className="text-neutral-200 font-semibold w-12 text-right">
                    {item.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">
                Conversational Timeline
              </h2>
              <p className="text-xs text-neutral-500">Silence vs Model Intervention across session hours</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-neutral-600" /> Silent
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Speaking
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {timelineData.map((slot) => {
              const total = slot.speaking + slot.silent;
              const speakPct = Math.round((slot.speaking / total) * 100);
              const silentPct = 100 - speakPct;
              return (
                <div key={slot.hour} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>{slot.hour}</span>
                    <span>
                      <strong className="text-emerald-400">{slot.speaking}</strong> spoke /{' '}
                      <strong className="text-neutral-400">{slot.silent}</strong> silent
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden flex border border-neutral-800">
                    <div className="bg-emerald-500 h-full" style={{ width: `${speakPct}%` }} />
                    <div className="bg-neutral-700 h-full" style={{ width: `${silentPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Decisions Table */}
      <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-200">
              Recent Attention Decisions
            </h2>
            <p className="text-xs text-neutral-500">
              Click any row to inspect logits, timing guards, and gate reasons in the inspector
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPlayground}
            className="text-xs text-neutral-400 hover:text-white font-medium flex items-center gap-1 transition"
          >
            <span>Open Decision Playground</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Selected Action</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Mid-Thought</th>
                <th className="py-2.5 px-3">Importance</th>
                <th className="py-2.5 px-3">Gate Outcome</th>
                <th className="py-2.5 px-3">Bedrock API</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
              {recentDecisions.slice(0, 8).map((dec) => {
                const colors = getActionColor(dec.action);
                return (
                  <tr
                    key={dec.id}
                    onClick={() => onSelectDecision(dec)}
                    className="hover:bg-neutral-900/60 cursor-pointer transition text-neutral-300"
                  >
                    <td className="py-2.5 px-3 text-neutral-500">{dec.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {formatActionLabel(dec.action)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-200">
                      {(dec.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={dec.is_mid_thought ? 'text-amber-400' : 'text-neutral-500'}
                      >
                        {dec.is_mid_thought ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300">{dec.importance}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dec.gate_allowed
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
                        }`}
                      >
                        {dec.gate_allowed ? 'ALLOWED' : 'BLOCKED'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={
                          dec.bedrock_called ? 'text-emerald-400 font-bold' : 'text-neutral-500'
                        }
                      >
                        {dec.bedrock_called ? 'CALLED' : 'AVOIDED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
