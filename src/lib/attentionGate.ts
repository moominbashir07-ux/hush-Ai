/**
 * Project HUSH - Pure Attention Gate Logic
 *
 * Evaluates whether a proposed model intervention passes through
 * the attention gate based on action type, confidence, conversational timing,
 * and minimum required importance.
 */

import type {
  DecisionAction,
  ImportanceLevel,
  GateBreakdown,
  DecisionResult,
} from '../types/index.ts';

export const IMPORTANCE_WEIGHTS: Record<ImportanceLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export interface GateEvaluationInput {
  id?: string;
  action: DecisionAction;
  confidence: number;
  is_mid_thought: boolean;
  importance: ImportanceLevel;
  confidence_threshold: number;
  minimum_importance: ImportanceLevel;
  decision_latency_ms?: number;
  user_utterance_snippet?: string;
  proposedResponse?: string;
  timestamp?: string;
}

/**
 * Pure evaluation function for the HUSH Attention Gate.
 * Does not mutate inputs or rely on external side-effects.
 */
export function evaluateAttentionGate(input: GateEvaluationInput): DecisionResult {
  const {
    id = `dec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    action,
    confidence,
    is_mid_thought,
    importance,
    confidence_threshold,
    minimum_importance,
    decision_latency_ms = Math.floor(18 + Math.random() * 14),
    user_utterance_snippet,
    proposedResponse,
    timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  } = input;

  // 1. Action condition: must not be STAY_SILENT
  const isActionAllowed = action !== 'STAY_SILENT';
  const actionCondition = {
    passed: isActionAllowed,
    description: 'Proposed action is not STAY_SILENT',
    failureReason: !isActionAllowed
      ? 'The Decider explicitly determined to STAY_SILENT.'
      : undefined,
  };

  // 2. Confidence condition: confidence >= threshold (clamped comparison to avoid float jitter)
  const isConfidenceMet = Math.round(confidence * 100) >= Math.round(confidence_threshold * 100);
  const confidenceCondition = {
    passed: isConfidenceMet,
    description: `Confidence ${(confidence * 100).toFixed(0)}% meets threshold ${(confidence_threshold * 100).toFixed(0)}%`,
    failureReason: !isConfidenceMet
      ? `Confidence (${(confidence * 100).toFixed(0)}%) is below policy threshold (${(confidence_threshold * 100).toFixed(0)}%).`
      : undefined,
  };

  // 3. Mid-thought condition: speaker is not in the middle of formulating an utterance
  const isNotMidThought = !is_mid_thought;
  const midThoughtCondition = {
    passed: isNotMidThought,
    description: 'Speaker is not mid-thought',
    failureReason: !isNotMidThought
      ? 'Speaker is still explaining (mid-thought pause detected). Intervention suppressed.'
      : undefined,
  };

  // 4. Importance condition: importance weight >= minimum importance weight
  const inputWeight = IMPORTANCE_WEIGHTS[importance] ?? 1;
  const minWeight = IMPORTANCE_WEIGHTS[minimum_importance] ?? 1;
  const isImportanceMet = inputWeight >= minWeight;
  const importanceCondition = {
    passed: isImportanceMet,
    description: `Importance ${importance} meets minimum policy ${minimum_importance}`,
    failureReason: !isImportanceMet
      ? `Utterance importance (${importance}) does not satisfy minimum policy requirement (${minimum_importance}).`
      : undefined,
  };

  const gate_breakdown: GateBreakdown = {
    actionNotSilent: actionCondition,
    confidenceMet: confidenceCondition,
    notMidThought: midThoughtCondition,
    importanceMet: importanceCondition,
  };

  // Determine overall gate outcome
  const gate_allowed =
    isActionAllowed && isConfidenceMet && isNotMidThought && isImportanceMet;

  // Generate concise explanation of blocking cause or allowance
  let gate_reason = 'All attention conditions satisfied. Intervention permitted.';
  if (!gate_allowed) {
    const failedReasons: string[] = [];
    if (!actionCondition.passed) failedReasons.push('Action is STAY_SILENT');
    if (!confidenceCondition.passed) failedReasons.push(`Confidence ${(confidence * 100).toFixed(0)}% < ${(confidence_threshold * 100).toFixed(0)}%`);
    if (!midThoughtCondition.passed) failedReasons.push('Speaker is mid-thought');
    if (!importanceCondition.passed) failedReasons.push(`Importance ${importance} < ${minimum_importance}`);
    gate_reason = `Blocked by Gate: ${failedReasons.join('; ')}`;
  }

  return {
    id,
    timestamp,
    action,
    confidence,
    is_mid_thought,
    importance,
    confidence_threshold,
    minimum_importance,
    gate_allowed,
    gate_reason,
    gate_breakdown,
    decision_latency_ms,
    bedrock_called: gate_allowed,
    execution_mode: 'DEMO MODE',
    user_utterance_snippet,
    proposedResponse,
  };
}

/**
 * Format action for display
 */
export function formatActionLabel(action: DecisionAction): string {
  switch (action) {
    case 'STAY_SILENT':
      return 'STAY SILENT';
    case 'CORRECT_FACT':
      return 'CORRECT FACT';
    case 'ANSWER_QUESTION':
      return 'ANSWER QUESTION';
    case 'FLAG_ACTION_ITEM':
      return 'FLAG ACTION ITEM';
    case 'SUGGEST_RESOURCE':
      return 'SUGGEST RESOURCE';
    default:
      return action;
  }
}

/**
 * Action badge color classes
 */
export function getActionColor(action: DecisionAction): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  switch (action) {
    case 'STAY_SILENT':
      return {
        bg: 'bg-neutral-900',
        text: 'text-neutral-400',
        border: 'border-neutral-800',
        glow: 'shadow-none',
      };
    case 'ANSWER_QUESTION':
      return {
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-300',
        border: 'border-emerald-700/60',
        glow: 'shadow-emerald-950/20',
      };
    case 'CORRECT_FACT':
      return {
        bg: 'bg-amber-950/60',
        text: 'text-amber-300',
        border: 'border-amber-700/60',
        glow: 'shadow-amber-950/20',
      };
    case 'FLAG_ACTION_ITEM':
      return {
        bg: 'bg-neutral-850',
        text: 'text-neutral-200',
        border: 'border-neutral-700',
        glow: 'shadow-none',
      };
    case 'SUGGEST_RESOURCE':
      return {
        bg: 'bg-neutral-900',
        text: 'text-neutral-300',
        border: 'border-neutral-750',
        glow: 'shadow-none',
      };
    default:
      return {
        bg: 'bg-neutral-900',
        text: 'text-neutral-300',
        border: 'border-neutral-800',
        glow: 'shadow-none',
      };
  }
}
