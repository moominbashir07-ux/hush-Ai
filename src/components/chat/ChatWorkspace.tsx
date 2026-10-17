/**
 * Project HUSH - Primary Chat Workspace
 *
 * Implements conversational timeline, inline attention decision events,
 * composer with attention timing awareness, interactive 3D hero with Spotlight,
 * and the 30-Second Guided Demo flow for Hackathon judges.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sliders,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Boxes,
} from 'lucide-react';
import type {
  ChatMessage,
  Conversation,
  DecisionResult,
  AttentionPolicy,
} from '../../types/index.ts';
import { ThreeNeuralOrb, type OrbAttentionState } from '../ui/ThreeNeuralOrb.tsx';
import { SplineScene } from '../ui/splite.tsx';
import { Card } from '../ui/card.tsx';
import { Spotlight } from '../ui/spotlight.tsx';
import { formatActionLabel, getActionColor } from '../../lib/attentionGate.ts';

interface ChatWorkspaceProps {
  conversation: Conversation;
  policy: AttentionPolicy;
  onSendMessage: (userText: string) => void;
  onClearConversation: () => void;
  onNewConversation: () => void;
  onSelectDecision: (dec: DecisionResult) => void;
  onPolicyChange: (policy: AttentionPolicy) => void;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  conversation,
  policy,
  onSendMessage,
  onClearConversation,
  onNewConversation,
  onSelectDecision,
  onPolicyChange,
  inspectorOpen,
  onToggleInspector,
}) => {
  const [inputText, setInputText] = useState('');
  const [guidedDemoStep, setGuidedDemoStep] = useState<number | null>(null);
  const [orbState, setOrbState] = useState<OrbAttentionState>('idle');
  const [active3DEngine, setActive3DEngine] = useState<'spline' | 'three'>('spline');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // Derive orb state from latest event
  useEffect(() => {
    if (guidedDemoStep !== null) return;
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    if (!lastMsg) {
      setOrbState('idle');
      return;
    }
    if (lastMsg.decisionEvent) {
      if (lastMsg.decisionEvent.gate_allowed) {
        setOrbState('speaking');
      } else {
        setOrbState('silent');
      }
    } else if (lastMsg.role === 'assistant') {
      setOrbState('speaking');
    }
  }, [conversation.messages, guidedDemoStep]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setOrbState('evaluating');
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const examplePrompts = [
    'Help me organize my presentation.',
    'Review this discussion for action items.',
    'Wait until I finish explaining before responding...',
  ];

  // 30-Second Guided Demo sequence
  const handleStartGuidedDemo = () => {
    setGuidedDemoStep(1);
    setOrbState('listening');
  };

  const handleAdvanceGuidedDemo = () => {
    if (guidedDemoStep === null) return;

    if (guidedDemoStep === 1) {
      setGuidedDemoStep(2);
      setOrbState('silent');
      const midThoughtText = "I need help organizing our AI Studio presentation, but let me explain the requirements first...";
      onSendMessage(midThoughtText);
    } else if (guidedDemoStep === 2) {
      setGuidedDemoStep(3);
      setOrbState('speaking');
      const finishedText = "The presentation must cover our attention-aware gate, Strands Decider 2B, and benchmark latency.";
      onSendMessage(finishedText);
    } else if (guidedDemoStep === 3) {
      setGuidedDemoStep(4);
      setOrbState('blocked');
      onPolicyChange({
        ...policy,
        confidenceThreshold: 0.95,
      });
    } else if (guidedDemoStep === 4) {
      setGuidedDemoStep(null);
      setOrbState('idle');
      onPolicyChange({
        ...policy,
        confidenceThreshold: 0.70,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden relative">
      {/* Workspace Header */}
      <header className="h-14 border-b border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between bg-black/90 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
            <h1 className="text-sm font-semibold text-neutral-100 truncate max-w-[200px] sm:max-w-md">
              {conversation.title}
            </h1>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-900 border border-neutral-700/80 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            DEMO MODE (LOCAL)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 30-sec Judge Demo Button */}
          <button
            type="button"
            onClick={guidedDemoStep === null ? handleStartGuidedDemo : handleAdvanceGuidedDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-white text-black shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {guidedDemoStep === null
                ? '30s Judge Tour'
                : `Next Step (${guidedDemoStep}/4)`}
            </span>
          </button>

          {/* New Chat */}
          <button
            type="button"
            onClick={onNewConversation}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-neutral-800 transition"
            title="New Conversation"
            aria-label="New Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Inspector Toggle */}
          <button
            type="button"
            onClick={onToggleInspector}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
              inspectorOpen
                ? 'bg-neutral-900 border-neutral-600 text-white'
                : 'bg-black border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            aria-label="Toggle Decision Inspector"
            aria-expanded={inspectorOpen}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspector</span>
          </button>
        </div>
      </header>

      {/* Guided Demo Ribbon */}
      {guidedDemoStep !== null && (
        <div className="bg-neutral-950 border-b border-neutral-800 px-4 py-2.5 text-xs flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-200 font-mono">
              [HACKATHON TOUR STEP {guidedDemoStep}/4]
            </span>
            <span className="text-neutral-400">
              {guidedDemoStep === 1 && "User begins explaining a complex problem with mid-thought markers..."}
              {guidedDemoStep === 2 && "Gate blocked speaking because speaker is mid-thought. Silence preserved!"}
              {guidedDemoStep === 3 && "User finished explaining. Gate opened: action permitted and model answered."}
              {guidedDemoStep === 4 && "Threshold raised to 0.95: stricter policy blocks borderlines. Click to reset."}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdvanceGuidedDemo}
            className="flex items-center gap-1 text-neutral-200 hover:text-white font-semibold underline text-xs"
          >
            <span>{guidedDemoStep === 4 ? 'Finish Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {conversation.messages.length === 0 ? (
          /* Empty State with Spotlight Card & 3D Experience */
          <div className="max-w-4xl mx-auto py-2 space-y-6">
            <Card className="w-full min-h-[460px] bg-black/[0.96] border border-neutral-800 relative overflow-hidden shadow-2xl">
              <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
                size={340}
              />

              <div className="flex flex-col lg:flex-row h-full">
                {/* Left content */}
                <div className="flex-1 p-6 sm:p-10 relative z-10 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 w-fit mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-300">
                      DECISION ENGINE • DEMO
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-400 tracking-tight">
                    Think before you speak.
                  </h1>

                  <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed">
                    Hush evaluates conversation timing, confidence thresholds, and importance before deciding whether an intervention is warranted.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <div className="text-[11px] font-mono text-neutral-500 mr-2">3D Visual Engine:</div>
                    <button
                      type="button"
                      onClick={() => setActive3DEngine('spline')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition ${
                        active3DEngine === 'spline'
                          ? 'bg-neutral-100 text-black border-white'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      Spline 3D Scene
                    </button>
                    <button
                      type="button"
                      onClick={() => setActive3DEngine('three')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition ${
                        active3DEngine === 'three'
                          ? 'bg-neutral-100 text-black border-white'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      Three.js Attention Core
                    </button>
                  </div>
                </div>

                {/* Right 3D Visual Content */}
                <div className="flex-1 relative min-h-[300px] flex items-center justify-center p-4">
                  {active3DEngine === 'spline' ? (
                    <SplineScene
                      scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ThreeNeuralOrb state={orbState} size="hero" />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Prompt Chips */}
            <div className="w-full space-y-2">
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold px-1">
                Try a conversational timing scenario:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInputText(prompt)}
                    className="p-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-neutral-100 text-xs text-left transition flex items-center justify-between group shadow-sm"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Timeline of Messages & Decision Events */
          <div className="max-w-3xl mx-auto space-y-5">
            {conversation.messages.map((msg) => (
              <React.Fragment key={msg.id}>
                {/* User Message */}
                {msg.role === 'user' && (
                  <div className="flex gap-3 justify-end items-start group">
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-neutral-900 border border-neutral-750 px-4 py-3 text-neutral-100 shadow-md text-sm leading-relaxed">
                      <p>{msg.content}</p>
                      <span className="block text-[10px] font-mono text-neutral-500 text-right mt-1">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-300">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* Inline Decision Event Card */}
                {msg.decisionEvent && (
                  <div className="flex justify-center my-3">
                    <button
                      type="button"
                      onClick={() => onSelectDecision(msg.decisionEvent!)}
                      className="w-full max-w-xl text-left rounded-xl border border-neutral-800/90 bg-neutral-950/90 hover:border-neutral-600 p-3.5 shadow-md transition group relative overflow-hidden"
                      aria-label="Inspect Attention Gate Decision"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold">
                            DECISION EVENT
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                              getActionColor(msg.decisionEvent.action).bg
                            } ${getActionColor(msg.decisionEvent.action).text} ${
                              getActionColor(msg.decisionEvent.action).border
                            }`}
                          >
                            {formatActionLabel(msg.decisionEvent.action)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                              msg.decisionEvent.gate_allowed
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/60'
                                : 'bg-rose-950/70 text-rose-300 border border-rose-700/60'
                            }`}
                          >
                            {msg.decisionEvent.gate_allowed ? (
                              <>
                                <Volume2 className="w-3 h-3" /> GATE: ALLOWED
                              </>
                            ) : (
                              <>
                                <VolumeX className="w-3 h-3" /> GATE: BLOCKED
                              </>
                            )}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-200 transition" />
                        </div>
                      </div>

                      {/* Compact metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-neutral-400 bg-neutral-900/60 p-2 rounded-lg border border-neutral-800">
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Confidence</span>
                          <span className="text-neutral-200 font-semibold">
                            {(msg.decisionEvent.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Mid-Thought</span>
                          <span
                            className={
                              msg.decisionEvent.is_mid_thought
                                ? 'text-amber-400 font-semibold'
                                : 'text-neutral-200'
                            }
                          >
                            {msg.decisionEvent.is_mid_thought ? 'YES' : 'NO'}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Importance</span>
                          <span className="text-neutral-300">{msg.decisionEvent.importance}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px]">Bedrock API</span>
                          <span
                            className={
                              msg.decisionEvent.bedrock_called
                                ? 'text-emerald-400 font-bold'
                                : 'text-neutral-500'
                            }
                          >
                            {msg.decisionEvent.bedrock_called ? 'CALLED' : 'NOT CALLED'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
                        <span className="truncate mr-2">
                          <strong className="text-neutral-300">Gate Reason:</strong> {msg.decisionEvent.gate_reason}
                        </span>
                        <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200 underline font-sans shrink-0">
                          Inspect details →
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Assistant Message */}
                {msg.role === 'assistant' && (
                  <div className="flex gap-3 justify-start items-start">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-200 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-sm bg-neutral-950 border border-neutral-800 px-4 py-3 text-neutral-200 text-sm leading-relaxed shadow-sm">
                      <p>{msg.content}</p>
                      <div className="flex items-center justify-between border-t border-neutral-800 mt-2.5 pt-1.5 text-[10px] font-mono text-neutral-500">
                        <span>HUSH COPILOT (DEMO)</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer Section */}
      <footer className="border-t border-neutral-800/80 bg-black/95 p-3 sm:p-4 shrink-0 z-10">
        <div className="max-w-3xl mx-auto space-y-2">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Speak with Hush... (e.g. ask a question, share an update, or use trailing '...' to test mid-thought)"
              rows={2}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-500 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-neutral-500 resize-none pr-14 transition"
              aria-label="Message composer"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-neutral-100 hover:bg-white disabled:opacity-40 disabled:hover:bg-neutral-100 text-black transition shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Attention Gate Active — Copilot evaluates timing before speaking
            </span>
            <span className="hidden sm:inline">Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
