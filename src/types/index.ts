/**
 * Project HUSH - Core Types & Interfaces
 */

export type DecisionAction =
  | 'STAY_SILENT'
  | 'CORRECT_FACT'
  | 'ANSWER_QUESTION'
  | 'FLAG_ACTION_ITEM'
  | 'SUGGEST_RESOURCE';

export type ImportanceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AttentionPolicy {
  confidenceThreshold: number; // e.g. 0.70 (0.50 to 0.95)
  minimumImportance: ImportanceLevel; // 'LOW' | 'MEDIUM' | 'HIGH'
  autoOpenInspector: boolean;
  reducedMotion: boolean;
  density: 'comfortable' | 'compact';
  soundEnabled: boolean;
}

export interface GateConditionResult {
  passed: boolean;
  description: string;
  failureReason?: string;
}

export interface GateBreakdown {
  actionNotSilent: GateConditionResult;
  confidenceMet: GateConditionResult;
  notMidThought: GateConditionResult;
  importanceMet: GateConditionResult;
}

export interface DecisionResult {
  id: string;
  timestamp: string;
  action: DecisionAction;
  confidence: number; // 0.0 - 1.0
  is_mid_thought: boolean;
  importance: ImportanceLevel;
  confidence_threshold: number;
  minimum_importance: ImportanceLevel;
  gate_allowed: boolean;
  gate_reason: string;
  gate_breakdown: GateBreakdown;
  decision_latency_ms: number;
  bedrock_called: boolean;
  execution_mode: 'DEMO MODE' | 'LIVE BENCHMARK';
  user_utterance_snippet?: string;
  proposedResponse?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  decisionEvent?: DecisionResult;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface PlaygroundScenario {
  id: string;
  title: string;
  description: string;
  category: 'direct-question' | 'mid-thought' | 'correction' | 'action-item' | 'resource' | 'low-importance';
  transcript: string;
  speakerRole: string;
  baseDecision: {
    action: DecisionAction;
    confidence: number;
    is_mid_thought: boolean;
    importance: ImportanceLevel;
    rationale: string;
    proposedResponse?: string;
  };
}

export interface EvalMetricSummary {
  datasetSize: number;
  correctActionRate: number; // percentage
  speakingPrecision: number; // percentage
  speakingRecall: number; // percentage
  unnecessaryInterventionsPer10Min: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  bedrockCallRate: number; // percentage
  lastEvaluatedAt?: string;
}

export type ActiveNav =
  | 'overview'
  | 'chat'
  | 'playground'
  | 'evaluations'
  | 'patterns'
  | 'settings';
