/**
 * Project HUSH - An Immersive 3D AI Chatbot with an Attention-Aware Decision Engine
 *
 * Main application coordinator managing navigation, conversations,
 * attention policy persistence, decision history, and view rendering.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  ActiveNav,
  Conversation,
  DecisionResult,
  AttentionPolicy,
  ChatMessage,
  DecisionAction,
  ImportanceLevel,
} from './types/index.ts';
import {
  DEFAULT_ATTENTION_POLICY,
  getInitialConversations,
  PLAYGROUND_SCENARIOS,
  INITIAL_EVAL_METRICS,
} from './lib/sampleData.ts';
import { evaluateAttentionGate } from './lib/attentionGate.ts';
import { AppShell } from './components/layout/AppShell.tsx';
import { ChatWorkspace } from './components/chat/ChatWorkspace.tsx';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard.tsx';
import { DecisionPlayground } from './components/playground/DecisionPlayground.tsx';
import { EvaluationsWorkspace } from './components/evaluations/EvaluationsWorkspace.tsx';
import { DecisionPatterns } from './components/patterns/DecisionPatterns.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';

const STORAGE_KEY_POLICY = 'hush_attention_policy_v1';
const STORAGE_KEY_CONVS = 'hush_conversations_v1';

export default function App() {
  // 1. Policy state with localStorage persistence
  const [policy, setPolicy] = useState<AttentionPolicy>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POLICY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading policy from localStorage', e);
    }
    return DEFAULT_ATTENTION_POLICY;
  });

  // Save policy changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POLICY, JSON.stringify(policy));
    } catch (e) {
      console.warn('Failed writing policy to localStorage', e);
    }
  }, [policy]);

  // 2. Navigation State
  const [activeNav, setActiveNav] = useState<ActiveNav>('chat');

  // 3. Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed reading conversations from localStorage', e);
    }
    return getInitialConversations(DEFAULT_ATTENTION_POLICY);
  });

  // Save conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed writing conversations to localStorage', e);
    }
  }, [conversations]);

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id ?? 'conv-hackathon-demo';
  });

  const activeConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConversationId) ??
      conversations[0] ?? {
        id: 'new-conv',
        title: 'New Conversation',
        updatedAt: 'Just now',
        messages: [],
      }
    );
  }, [conversations, activeConversationId]);

  // 4. Decision Inspector & History State
  const [currentDecision, setCurrentDecision] = useState<DecisionResult | null>(() => {
    const firstMsgWithDec = activeConversation.messages.find((m) => m.decisionEvent);
    return firstMsgWithDec?.decisionEvent ?? null;
  });

  const [decisionHistory, setDecisionHistory] = useState<DecisionResult[]>(() => {
    const list: DecisionResult[] = [];
    conversations.forEach((c) => {
      c.messages.forEach((m) => {
        if (m.decisionEvent) list.push(m.decisionEvent);
      });
    });
    return list;
  });

  const [inspectorOpen, setInspectorOpen] = useState(true);

  // Helper to re-evaluate active decision when policy changes
  const handlePolicyChange = useCallback((newPolicy: AttentionPolicy) => {
    setPolicy(newPolicy);
    setCurrentDecision((prev) => {
      if (!prev) return null;
      return evaluateAttentionGate({
        id: prev.id,
        action: prev.action,
        confidence: prev.confidence,
        is_mid_thought: prev.is_mid_thought,
        importance: prev.importance,
        confidence_threshold: newPolicy.confidenceThreshold,
        minimum_importance: newPolicy.minimumImportance,
        decision_latency_ms: prev.decision_latency_ms,
        user_utterance_snippet: prev.user_utterance_snippet,
        proposedResponse: prev.proposedResponse,
        timestamp: prev.timestamp,
      });
    });
  }, []);

  // 5. User Sends Message Handler (Demo Mode Engine)
  const handleSendMessage = useCallback(
    (userText: string) => {
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const lower = userText.toLowerCase();

      // Conversational Timing & Intent Classification heuristics
      let action: DecisionAction = 'ANSWER_QUESTION';
      let confidence = 0.88;
      let is_mid_thought = false;
      let importance: ImportanceLevel = 'HIGH';
      let assistantReply: string | undefined = undefined;

      // Heuristic 1: Mid-thought protection (trailing ellipsis or hesitation markers)
      if (
        userText.endsWith('...') ||
        lower.includes('let me explain first') ||
        lower.includes('wait until') ||
        lower.includes('and also, wait') ||
        lower.includes('hold on')
      ) {
        action = 'STAY_SILENT';
        confidence = 0.94;
        is_mid_thought = true;
        importance = 'HIGH';
        assistantReply = undefined; // Hush will NOT speak!
      }
      // Heuristic 2: Action item
      else if (
        lower.includes('action item') ||
        lower.includes('remember to') ||
        lower.includes('make sure') ||
        lower.includes('please review') ||
        lower.includes('assign')
      ) {
        action = 'FLAG_ACTION_ITEM';
        confidence = 0.89;
        is_mid_thought = false;
        importance = 'HIGH';
        assistantReply = `📌 Action Item Recorded: "${userText}". Tagged for review in team sprint buffer.`;
      }
      // Heuristic 3: Factual correction
      else if (
        lower.includes('actually') ||
        lower.includes('correction') ||
        lower.includes('not true') ||
        lower.includes('wrong')
      ) {
        action = 'CORRECT_FACT';
        confidence = 0.86;
        is_mid_thought = false;
        importance = 'HIGH';
        assistantReply = `Understood. Clarifying the baseline parameter: Decider 2B runs locally while Bedrock orchestrates heavy generation tasks.`;
      }
      // Heuristic 4: Casual banter / low importance
      else if (
        lower === 'hello' ||
        lower === 'hi' ||
        lower.includes('haha') ||
        lower.includes('coffee') ||
        lower.includes('cool thanks')
      ) {
        action = 'STAY_SILENT';
        confidence = 0.92;
        is_mid_thought = false;
        importance = 'LOW';
        assistantReply = undefined;
      }
      // Heuristic 5: Resource suggestion
      else if (lower.includes('doc') || lower.includes('resource') || lower.includes('link') || lower.includes('repo')) {
        action = 'SUGGEST_RESOURCE';
        confidence = 0.79;
        is_mid_thought = false;
        importance = 'MEDIUM';
        assistantReply = `Relevant reference: Check Section 4.2 of the Strands Decider architecture blueprint at /docs/decider-specs.md.`;
      }
      // Default: Direct question / instruction
      else {
        action = 'ANSWER_QUESTION';
        confidence = 0.91;
        is_mid_thought = false;
        importance = 'HIGH';
        assistantReply = `Hush Attention Gate approved response generation: Based on your context, the optimal approach balances timing thresholds (currently ${(policy.confidenceThreshold * 100).toFixed(0)}%) with real-time utterance completion.`;
      }

      // Evaluate the pure attention gate
      const decResult = evaluateAttentionGate({
        action,
        confidence,
        is_mid_thought,
        importance,
        confidence_threshold: policy.confidenceThreshold,
        minimum_importance: policy.minimumImportance,
        user_utterance_snippet: userText.slice(0, 80),
        proposedResponse: assistantReply,
      });

      // User Message with attached decision event
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-u`,
        role: 'user',
        content: userText,
        timestamp: now,
        decisionEvent: decResult,
      };

      const newMessages = [...activeConversation.messages, userMsg];

      // If Gate allowed speaking, emit assistant response!
      if (decResult.gate_allowed && assistantReply) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: 'assistant',
          content: assistantReply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };
        newMessages.push(assistantMsg);
      }

      const updatedConv: Conversation = {
        ...activeConversation,
        updatedAt: 'Just now',
        messages: newMessages,
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === updatedConv.id ? updatedConv : c))
      );

      setCurrentDecision(decResult);
      setDecisionHistory((prev) => [decResult, ...prev]);
    },
    [activeConversation, policy]
  );

  // New Chat handler
  const handleNewChat = useCallback(() => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      updatedAt: 'Just now',
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setCurrentDecision(null);
  }, []);

  // Clear conversation handler
  const handleClearConversation = useCallback(() => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, messages: [] } : c
      )
    );
    setCurrentDecision(null);
  }, [activeConversationId]);

  // Reset all sample data handler
  const handleResetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_POLICY);
    localStorage.removeItem(STORAGE_KEY_CONVS);
    setPolicy(DEFAULT_ATTENTION_POLICY);
    const initialConvs = getInitialConversations(DEFAULT_ATTENTION_POLICY);
    setConversations(initialConvs);
    setActiveConversationId(initialConvs[0].id);
    const initialDec = initialConvs[0].messages.find((m) => m.decisionEvent)?.decisionEvent ?? null;
    setCurrentDecision(initialDec);

    const history: DecisionResult[] = [];
    initialConvs.forEach((c) => {
      c.messages.forEach((m) => {
        if (m.decisionEvent) history.push(m.decisionEvent);
      });
    });
    setDecisionHistory(history);
  }, []);

  return (
    <AppShell
      activeNav={activeNav}
      onSelectNav={setActiveNav}
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={setActiveConversationId}
      onNewChat={handleNewChat}
      currentDecision={currentDecision}
      decisionHistory={decisionHistory}
      policy={policy}
      onPolicyChange={handlePolicyChange}
      onSelectHistoricalDecision={(dec) => {
        setCurrentDecision(dec);
        setInspectorOpen(true);
      }}
    >
      {activeNav === 'chat' && (
        <ChatWorkspace
          conversation={activeConversation}
          policy={policy}
          onSendMessage={handleSendMessage}
          onClearConversation={handleClearConversation}
          onNewConversation={handleNewChat}
          onSelectDecision={(dec) => {
            setCurrentDecision(dec);
            setInspectorOpen(true);
          }}
          onPolicyChange={handlePolicyChange}
          inspectorOpen={inspectorOpen}
          onToggleInspector={() => setInspectorOpen(!inspectorOpen)}
        />
      )}

      {activeNav === 'overview' && (
        <OverviewDashboard
          recentDecisions={decisionHistory}
          onSelectDecision={(dec) => {
            setCurrentDecision(dec);
            setInspectorOpen(true);
          }}
          onOpenPlayground={() => setActiveNav('playground')}
          onOpenChat={() => setActiveNav('chat')}
        />
      )}

      {activeNav === 'playground' && (
        <DecisionPlayground
          scenarios={PLAYGROUND_SCENARIOS}
          policy={policy}
          onPolicyChange={handlePolicyChange}
          onSelectDecision={(dec) => {
            setCurrentDecision(dec);
            setInspectorOpen(true);
          }}
        />
      )}

      {activeNav === 'evaluations' && (
        <EvaluationsWorkspace metrics={INITIAL_EVAL_METRICS} />
      )}

      {activeNav === 'patterns' && <DecisionPatterns />}

      {activeNav === 'settings' && (
        <SettingsView
          policy={policy}
          onPolicyChange={handlePolicyChange}
          onResetAllData={handleResetAllData}
        />
      )}
    </AppShell>
  );
}
