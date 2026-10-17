/**
 * Project HUSH - Reusable Decision Patterns
 *
 * Demonstrates modular engineering primitives with Spotlight cards in an obsidian theme.
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { REUSABLE_PATTERNS } from '../../lib/sampleData.ts';
import { Card } from '../ui/card.tsx';
import { Spotlight } from '../ui/spotlight.tsx';

export const DecisionPatterns: React.FC = () => {
  const [selectedPatternId, setSelectedPatternId] = useState(REUSABLE_PATTERNS[0].id);
  const [copied, setCopied] = useState(false);

  const activePattern =
    REUSABLE_PATTERNS.find((p) => p.id === selectedPatternId) ?? REUSABLE_PATTERNS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activePattern.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-neutral-300" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-400 font-semibold">
              ARCHITECTURE & PATTERNS
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-400 tracking-tight">
            Decision Patterns
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Modular engineering primitives designed for Strands Decider 2B and downstream Amazon Bedrock orchestrators.
          </p>
        </div>
      </div>

      {/* Grid of 4 Reusable Pattern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REUSABLE_PATTERNS.map((pattern) => {
          const isSelected = pattern.id === selectedPatternId;
          return (
            <Card
              key={pattern.id}
              onClick={() => setSelectedPatternId(pattern.id)}
              className={`p-5 cursor-pointer transition flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'bg-neutral-900 border-neutral-400 shadow-xl'
                  : 'bg-black/[0.96] border-neutral-800 hover:border-neutral-700 hover:bg-neutral-950'
              }`}
            >
              <Spotlight fill="white" size={160} />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold">
                    {pattern.badge}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <h3 className="text-base font-bold text-neutral-100 mb-1">{pattern.name}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">{pattern.tagline}</p>
              </div>

              <div className="border-t border-neutral-800 pt-3 flex items-center justify-between text-xs font-medium text-neutral-300">
                <span>View Architecture & Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Code & Spec Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Specification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-4 relative overflow-hidden group">
            <Spotlight fill="white" size={240} />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                PATTERN SPECIFICATION
              </span>
              <h2 className="text-xl font-bold text-neutral-100">{activePattern.name}</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {activePattern.tagline}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Required Input Fields
                </span>
                <div className="space-y-1">
                  {activePattern.inputs.map((inp, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-200"
                    >
                      {inp}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Deterministic Output Contract
                </span>
                <div className="space-y-1">
                  {activePattern.outputs.map((out, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-emerald-300"
                    >
                      {out}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-[11px] text-neutral-400">
              <p>
                <strong>Backend Contract Note:</strong> Illustrated code represents the reference TypeScript implementation, synchronizing directly with the Python Decider 2B service contract.
              </p>
            </div>
          </Card>
        </div>

        {/* Code Preview Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 bg-black/[0.96] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-neutral-400" />
                Reference Implementation ({activePattern.name})
              </span>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Block */}
            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 font-mono text-xs text-neutral-300 overflow-x-auto leading-relaxed shadow-inner">
              <pre>
                <code>{activePattern.codeSnippet}</code>
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
