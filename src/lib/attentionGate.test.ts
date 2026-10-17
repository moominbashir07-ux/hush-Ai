import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAttentionGate, IMPORTANCE_WEIGHTS } from './attentionGate.ts';

test('Attention Gate allows intervention when all 4 conditions are satisfied', () => {
  const result = evaluateAttentionGate({
    action: 'ANSWER_QUESTION',
    confidence: 0.88,
    is_mid_thought: false,
    importance: 'HIGH',
    confidence_threshold: 0.70,
    minimum_importance: 'MEDIUM',
  });

  assert.equal(result.gate_allowed, true);
  assert.equal(result.bedrock_called, true);
  assert.equal(result.gate_breakdown.actionNotSilent.passed, true);
  assert.equal(result.gate_breakdown.confidenceMet.passed, true);
  assert.equal(result.gate_breakdown.notMidThought.passed, true);
  assert.equal(result.gate_breakdown.importanceMet.passed, true);
});

test('Attention Gate blocks when action is STAY_SILENT', () => {
  const result = evaluateAttentionGate({
    action: 'STAY_SILENT',
    confidence: 0.95,
    is_mid_thought: false,
    importance: 'HIGH',
    confidence_threshold: 0.70,
    minimum_importance: 'LOW',
  });

  assert.equal(result.gate_allowed, false);
  assert.equal(result.bedrock_called, false);
  assert.equal(result.gate_breakdown.actionNotSilent.passed, false);
  assert.match(result.gate_reason, /STAY_SILENT/);
});

test('Attention Gate blocks when confidence is below configured threshold', () => {
  const result = evaluateAttentionGate({
    action: 'CORRECT_FACT',
    confidence: 0.65,
    is_mid_thought: false,
    importance: 'HIGH',
    confidence_threshold: 0.70,
    minimum_importance: 'LOW',
  });

  assert.equal(result.gate_allowed, false);
  assert.equal(result.gate_breakdown.confidenceMet.passed, false);
  assert.match(result.gate_reason, /Confidence 65% < 70%/);
});

test('Attention Gate blocks when user is mid-thought', () => {
  const result = evaluateAttentionGate({
    action: 'ANSWER_QUESTION',
    confidence: 0.92,
    is_mid_thought: true,
    importance: 'HIGH',
    confidence_threshold: 0.70,
    minimum_importance: 'LOW',
  });

  assert.equal(result.gate_allowed, false);
  assert.equal(result.gate_breakdown.notMidThought.passed, false);
  assert.match(result.gate_reason, /mid-thought/);
});

test('Attention Gate evaluates importance hierarchy correctly', () => {
  assert.ok(IMPORTANCE_WEIGHTS['HIGH'] > IMPORTANCE_WEIGHTS['MEDIUM']);
  assert.ok(IMPORTANCE_WEIGHTS['MEDIUM'] > IMPORTANCE_WEIGHTS['LOW']);

  // LOW satisfies LOW
  const lowOk = evaluateAttentionGate({
    action: 'SUGGEST_RESOURCE',
    confidence: 0.85,
    is_mid_thought: false,
    importance: 'LOW',
    confidence_threshold: 0.70,
    minimum_importance: 'LOW',
  });
  assert.equal(lowOk.gate_allowed, true);

  // LOW fails MEDIUM minimum
  const lowFailsMedium = evaluateAttentionGate({
    action: 'SUGGEST_RESOURCE',
    confidence: 0.85,
    is_mid_thought: false,
    importance: 'LOW',
    confidence_threshold: 0.70,
    minimum_importance: 'MEDIUM',
  });
  assert.equal(lowFailsMedium.gate_allowed, false);
  assert.equal(lowFailsMedium.gate_breakdown.importanceMet.passed, false);
  assert.match(lowFailsMedium.gate_reason, /Importance LOW < MEDIUM/);
});

test('Adjusting threshold from 0.70 to 0.85 turns an allowed decision into a blocked decision', () => {
  const baseInput = {
    action: 'FLAG_ACTION_ITEM' as const,
    confidence: 0.78,
    is_mid_thought: false,
    importance: 'HIGH' as const,
    minimum_importance: 'LOW' as const,
  };

  const allowedAt70 = evaluateAttentionGate({
    ...baseInput,
    confidence_threshold: 0.70,
  });
  assert.equal(allowedAt70.gate_allowed, true);

  const blockedAt85 = evaluateAttentionGate({
    ...baseInput,
    confidence_threshold: 0.85,
  });
  assert.equal(blockedAt85.gate_allowed, false);
  assert.equal(blockedAt85.gate_breakdown.confidenceMet.passed, false);
});
