import { describe, expect } from 'vitest';
import {
  createEntityName,
  formatAgentResponse,
  validateAgentRequest,
  type AgentRequest,
} from '../../src/utils/agent-helpers';

describe('createEntityName', () => {
  test('combines entity type and session', () => {
    expect(createEntityName('AnalysisSession', 'session-001')).toBe('AnalysisSession_session-001');
  });

  test('appends additional identifiers', () => {
    const result = createEntityName('FileAnalysis', 'session-002', ['src/app.ts', 'hotfix']);
    expect(result).toBe('FileAnalysis_session-002_src/app.ts_hotfix');
  });
});

describe('validateAgentRequest', () => {
  test('returns valid result for well-formed request', () => {
    const request: AgentRequest = {
      version: '1.0',
      sessionId: 'session-003',
      action: 'analyze',
    };

    const result = validateAgentRequest(request, ['sessionId', 'action']);
    expect(result.valid).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  test('reports missing required fields', () => {
    const request = {
      version: '1.0',
    } as AgentRequest;

    const result = validateAgentRequest(request, ['sessionId', 'action']);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('Missing required field: sessionId');
    expect(result.errors).toContain('Missing required field: action');
  });
});

describe('formatAgentResponse', () => {
  test('includes success payloads', () => {
    const response = formatAgentResponse(true, { status: 'ok' });
    expect(response.success).toBeTruthy();
    expect(response.data).toStrictEqual({ status: 'ok' });
    expect(typeof response.timestamp).toBe('number');
  });

  test('includes error payloads', () => {
    const response = formatAgentResponse(false, undefined, 'Something went wrong');
    expect(response.success).toBeFalsy();
    expect(response.error).toBe('Something went wrong');
  });
});
