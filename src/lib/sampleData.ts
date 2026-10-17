/**
 * Project HUSH - Sample Data & Demo Scenarios
 *
 * All datasets and scenarios are explicitly marked as illustrative sample data
 * for demonstrating the Strands Decider + Attention Gate pipeline.
 */

import type {
  AttentionPolicy,
  Conversation,
  PlaygroundScenario,
  EvalMetricSummary,
  DecisionResult,
} from '../types/index.ts';
import { evaluateAttentionGate } from './attentionGate.ts';

export const DEFAULT_ATTENTION_POLICY: AttentionPolicy = {
  confidenceThreshold: 0.70,
  minimumImportance: 'MEDIUM',
  autoOpenInspector: true,
  reducedMotion: false,
  density: 'comfortable',
  soundEnabled: false,
};

export const PLAYGROUND_SCENARIOS: PlaygroundScenario[] = [
  {
    id: 'scenario-direct-question',
    title: 'Direct Question Requiring Answer',
    category: 'direct-question',
    speakerRole: 'Engineering Lead',
    description: 'User concludes their thought and directly prompts the AI for architecture guidance.',
    transcript: `Lead: "We need to finalize the caching tier for the attention gate cache before Friday. What is the recommended TTL for high-throughput decision deduplication in our Redis cluster?"`,
    baseDecision: {
      action: 'ANSWER_QUESTION',
      confidence: 0.92,
      is_mid_thought: false,
      importance: 'HIGH',
      rationale: 'Clear direct question ending with conclusive punctuation; requires factual architecture recommendation.',
      proposedResponse: 'For high-throughput decision deduplication in Redis, a TTL of 300ms to 500ms is standard for conversational turns, extending to 15 minutes for static utterance hashes.',
    },
  },
  {
    id: 'scenario-mid-thought',
    title: 'Speaker Still Explaining (Mid-Thought)',
    category: 'mid-thought',
    speakerRole: 'Product Manager',
    description: 'Speaker is actively formulating ideas with transitional phrases like "and also...", "let me clarify first...".',
    transcript: `PM: "I was looking at the latency graph, and also if we check the p99 numbers from yesterday's stress test... actually wait, let me pull up the Grafana dashboard link before you answer..."`,
    baseDecision: {
      action: 'STAY_SILENT',
      confidence: 0.94,
      is_mid_thought: true,
      importance: 'HIGH',
      rationale: 'Trailing ellipsis, self-interruption ("actually wait"), and explicit deferral marker detected.',
      proposedResponse: undefined,
    },
  },
  {
    id: 'scenario-factual-correction',
    title: 'Critical Factual Correction',
    category: 'correction',
    speakerRole: 'Developer',
    description: 'Speaker makes an incorrect factual statement regarding an API specification or security constraint.',
    transcript: `Dev: "Since Bedrock Claude 3.5 Sonnet accepts max 4k context tokens without streaming, we should chunk the entire user audio transcript into 500-word blocks."`,
    baseDecision: {
      action: 'CORRECT_FACT',
      confidence: 0.89,
      is_mid_thought: false,
      importance: 'HIGH',
      rationale: 'Factually inaccurate parameter: Anthropic Claude 3.5 on Bedrock supports a 200k token context window, not 4k.',
      proposedResponse: 'Correction note: Anthropic Claude 3.5 on Amazon Bedrock supports a 200,000 token context window (with up to 8,192 max output tokens), so manual 500-word chunking is unnecessary.',
    },
  },
  {
    id: 'scenario-action-item',
    title: 'Explicit Action Item Extraction',
    category: 'action-item',
    speakerRole: 'Scrum Master',
    description: 'Discussion produces an unassigned urgent deliverable that warrants immediate flagging.',
    transcript: `Scrum: "Sarah, please make sure the CloudFormation template for the Strands Decider runtime container gets reviewed by security before tomorrow's staging release."`,
    baseDecision: {
      action: 'FLAG_ACTION_ITEM',
      confidence: 0.88,
      is_mid_thought: false,
      importance: 'HIGH',
      rationale: 'Actionable directive with named assignee (Sarah), asset (CloudFormation template), and deadline (tomorrow staging release).',
      proposedResponse: '📌 Action Item Logged: Security review of CloudFormation template for Strands Decider container by tomorrow before staging release (Assignee: Sarah).',
    },
  },
  {
    id: 'scenario-suggest-resource',
    title: 'Contextual Technical Resource',
    category: 'resource',
    speakerRole: 'Backend Engineer',
    description: 'Team discusses a tricky distributed consistency problem where an established whitepaper or repo exists.',
    transcript: `Engineer: "We are seeing split-brain scenarios when two replica workers simultaneously evaluate the silence gate on the same session ID."`,
    baseDecision: {
      action: 'SUGGEST_RESOURCE',
      confidence: 0.79,
      is_mid_thought: false,
      importance: 'MEDIUM',
      rationale: 'Recognized consensus edge-case in conversational state tracking; reference architecture RFC available.',
      proposedResponse: 'Recommended Resource: Check Section 4.2 of "Distributed Attention Gate Consensus RFC-104" or the Redlock distributed locking recipe in `/docs/architecture/locking.md`.',
    },
  },
  {
    id: 'scenario-low-importance',
    title: 'Casual Conversational Banter',
    category: 'low-importance',
    speakerRole: 'Team Member',
    description: 'Casual banter that does not warrant interrupting the conversational flow.',
    transcript: `Alex: "Haha yeah, morning coffee is definitely a prerequisite for debugging WebGL shaders on a Monday."`,
    baseDecision: {
      action: 'STAY_SILENT',
      confidence: 0.95,
      is_mid_thought: false,
      importance: 'LOW',
      rationale: 'Social banter / rhetorical humor with zero instructional or informational need.',
      proposedResponse: undefined,
    },
  },
  {
    id: 'scenario-borderline-confidence',
    title: 'Borderline Confidence Utterance',
    category: 'direct-question',
    speakerRole: 'User',
    description: 'Vague query where Decider confidence is 0.74. At default 0.70 threshold it speaks; at 0.75+ threshold it stays silent!',
    transcript: `User: "I might want to see some stats about yesterday or maybe something else later."`,
    baseDecision: {
      action: 'ANSWER_QUESTION',
      confidence: 0.74,
      is_mid_thought: false,
      importance: 'MEDIUM',
      rationale: 'Ambiguous intent with tentative modal verbs ("might want", "maybe something else").',
      proposedResponse: 'I can show yesterday’s Attention Overview metrics, decision latency percentiles, or conversation breakdown. Which would you prefer?',
    },
  },
];

// Initial preloaded conversations
export function getInitialConversations(policy: AttentionPolicy): Conversation[] {
  // Decision 1: mid-thought silence
  const dec1: DecisionResult = evaluateAttentionGate({
    id: 'dec-init-1',
    timestamp: '10:14:02 AM',
    action: 'STAY_SILENT',
    confidence: 0.93,
    is_mid_thought: true,
    importance: 'HIGH',
    confidence_threshold: policy.confidenceThreshold,
    minimum_importance: policy.minimumImportance,
    decision_latency_ms: 19,
    user_utterance_snippet: 'I need help organizing the presentation, but let me explain...',
  });

  // Decision 2: allowed answer question
  const dec2: DecisionResult = evaluateAttentionGate({
    id: 'dec-init-2',
    timestamp: '10:14:24 AM',
    action: 'ANSWER_QUESTION',
    confidence: 0.88,
    is_mid_thought: false,
    importance: 'HIGH',
    confidence_threshold: policy.confidenceThreshold,
    minimum_importance: policy.minimumImportance,
    decision_latency_ms: 22,
    user_utterance_snippet: 'The presentation must explain the project, our architecture, and our evaluation results.',
  });

  // Decision 3: action item
  const dec3: DecisionResult = evaluateAttentionGate({
    id: 'dec-init-3',
    timestamp: '10:15:10 AM',
    action: 'FLAG_ACTION_ITEM',
    confidence: 0.89,
    is_mid_thought: false,
    importance: 'HIGH',
    confidence_threshold: policy.confidenceThreshold,
    minimum_importance: policy.minimumImportance,
    decision_latency_ms: 24,
    user_utterance_snippet: 'Marcus, remember to package the Strands Decider 2B Dockerfile by 4 PM.',
  });

  return [
    {
      id: 'conv-hackathon-demo',
      title: 'HUSH Attention Gate Hackathon Demo',
      updatedAt: 'Just now',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'I need help organizing the presentation, but let me explain the requirements first...',
          timestamp: '10:14:02 AM',
          decisionEvent: dec1,
        },
        {
          id: 'msg-2',
          role: 'user',
          content: 'The presentation must explain the project, our architecture, and our evaluation results.',
          timestamp: '10:14:24 AM',
          decisionEvent: dec2,
        },
        {
          id: 'msg-3',
          role: 'assistant',
          content: 'Start with the problem and proposed solution, then explain the Strands Decider architecture, and finish with the evaluation benchmark results showing 64% fewer unnecessary Bedrock calls.',
          timestamp: '10:14:25 AM',
        },
        {
          id: 'msg-4',
          role: 'user',
          content: 'Great. Marcus, remember to package the Strands Decider 2B Dockerfile by 4 PM today.',
          timestamp: '10:15:10 AM',
          decisionEvent: dec3,
        },
        {
          id: 'msg-5',
          role: 'assistant',
          content: '📌 Action Item Logged: Package Strands Decider 2B Dockerfile by 4:00 PM today (Assignee: Marcus).',
          timestamp: '10:15:11 AM',
        },
      ],
    },
    {
      id: 'conv-arch-review',
      title: 'Decider 2B & Bedrock Architecture',
      updatedAt: '2 hours ago',
      messages: [
        {
          id: 'msg-arch-1',
          role: 'user',
          content: 'What is the exact handoff contract between Strands Decider 2B and Amazon Bedrock in the pipeline?',
          timestamp: '08:30:12 AM',
          decisionEvent: evaluateAttentionGate({
            id: 'dec-arch-1',
            timestamp: '08:30:12 AM',
            action: 'ANSWER_QUESTION',
            confidence: 0.94,
            is_mid_thought: false,
            importance: 'HIGH',
            confidence_threshold: policy.confidenceThreshold,
            minimum_importance: policy.minimumImportance,
            decision_latency_ms: 18,
            user_utterance_snippet: 'What is the exact handoff contract between Strands Decider 2B...',
          }),
        },
        {
          id: 'msg-arch-2',
          role: 'assistant',
          content: 'Strands Decider 2B runs locally on incoming utterance tokens and produces a structured JSON output with `action`, `confidence`, `is_mid_thought`, and `importance`. If and only if the Attention Gate yields `gate_allowed: true`, the conversation buffer is forwarded to Amazon Bedrock InvokeModel API.',
          timestamp: '08:30:13 AM',
        },
      ],
    },
    {
      id: 'conv-standup-filter',
      title: 'Team Standup Silence Filter',
      updatedAt: 'Yesterday',
      messages: [
        {
          id: 'msg-stand-1',
          role: 'user',
          content: 'Morning everyone, coffee was delayed today haha.',
          timestamp: 'Yesterday 09:00 AM',
          decisionEvent: evaluateAttentionGate({
            id: 'dec-stand-1',
            timestamp: 'Yesterday 09:00 AM',
            action: 'STAY_SILENT',
            confidence: 0.96,
            is_mid_thought: false,
            importance: 'LOW',
            confidence_threshold: policy.confidenceThreshold,
            minimum_importance: policy.minimumImportance,
            decision_latency_ms: 15,
            user_utterance_snippet: 'Morning everyone, coffee was delayed today haha.',
          }),
        },
      ],
    },
  ];
}

export const INITIAL_EVAL_METRICS: EvalMetricSummary = {
  datasetSize: 1240,
  correctActionRate: 94.6,
  speakingPrecision: 92.4,
  speakingRecall: 89.1,
  unnecessaryInterventionsPer10Min: 0.38,
  medianLatencyMs: 21,
  p95LatencyMs: 38,
  bedrockCallRate: 35.8, // 64.2% avoided
  lastEvaluatedAt: 'Sample Benchmark Run (Local Validation Suite)',
};

export const REUSABLE_PATTERNS = [
  {
    id: 'pattern-attention-gate',
    name: 'Attention Gate',
    badge: 'Core Pattern',
    tagline: 'Multi-conditional gate preventing premature or irrelevant model invocation.',
    inputs: ['action: DecisionAction', 'confidence: float [0..1]', 'is_mid_thought: boolean', 'importance: LOW|MED|HIGH', 'policy: AttentionPolicy'],
    outputs: ['gate_allowed: boolean', 'gate_reason: string', 'breakdown: GateBreakdown'],
    codeSnippet: `// Pure Attention Gate Pattern
export function evaluateAttentionGate({
  action,
  confidence,
  is_mid_thought,
  importance,
  confidence_threshold = 0.70,
  minimum_importance = 'MEDIUM',
}: GateInput): GateOutput {
  const actionOk = action !== 'STAY_SILENT';
  const confOk = confidence >= confidence_threshold;
  const notMidThought = !is_mid_thought;
  const importanceOk = WEIGHTS[importance] >= WEIGHTS[minimum_importance];

  const allowed = actionOk && confOk && notMidThought && importanceOk;
  return {
    allowed,
    shouldInvokeBedrock: allowed,
    reason: allowed ? 'All conditions satisfied' : getBlockingReason(...),
  };
}`,
  },
  {
    id: 'pattern-mid-thought',
    name: 'Mid-Thought Protection',
    badge: 'Timing Guard',
    tagline: 'Prevents rude interruptions during pauses, hesitations, and multi-part reasoning.',
    inputs: ['audio_energy_profile', 'syntax_closure_score', 'temporal_pause_ms'],
    outputs: ['is_mid_thought: boolean', 'continuation_probability: float'],
    codeSnippet: `# Python Decider 2B Timing Guard
def detect_mid_thought(tokens, pause_duration_ms: float) -> bool:
    has_trailing_discourse = any(
        tokens.endswith(marker) for marker in ["and", "or", "wait", "actually", "..."]
    )
    if has_trailing_discourse and pause_duration_ms < 1800:
        return True  # Speaker is formulating next clause
    return False`,
  },
  {
    id: 'pattern-confidence-threshold',
    name: 'Confidence Thresholding',
    badge: 'Policy Control',
    tagline: 'Tunable calibration layer separating high-certainty interventions from noise.',
    inputs: ['decider_logits', 'calibrated_softmax_temperature', 'slider_threshold: float'],
    outputs: ['confidence_met: boolean', 'delta_to_threshold: float'],
    codeSnippet: `// Confidence Policy Validator
const isConfident = (confidence: number, threshold: number): boolean => {
  return Number(confidence.toFixed(2)) >= Number(threshold.toFixed(2));
};`,
  },
  {
    id: 'pattern-action-classifier',
    name: 'Five-Way Conversational Action Classifier',
    badge: 'Intent Router',
    tagline: 'Discretizes freeform speech into 5 actionable conversational primitives.',
    inputs: ['utterance_text', 'dialogue_history_window', 'speaker_metadata'],
    outputs: ['action: STAY_SILENT | CORRECT_FACT | ANSWER_QUESTION | FLAG_ACTION_ITEM | SUGGEST_RESOURCE'],
    codeSnippet: `enum DecisionAction {
  STAY_SILENT = "STAY_SILENT",
  CORRECT_FACT = "CORRECT_FACT",
  ANSWER_QUESTION = "ANSWER_QUESTION",
  FLAG_ACTION_ITEM = "FLAG_ACTION_ITEM",
  SUGGEST_RESOURCE = "SUGGEST_RESOURCE",
}`,
  },
];
