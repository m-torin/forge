/**
 * Tests for agent helper utilities
 */
import { describe, expect } from 'vitest';
import {
  createEntityName,
  extractObservation,
  formatAgentResponse,
  validateAgentRequest,
  type AgentRequest,
  type EntityType,
  type MCPEntity,
} from '../../src/utils/agent-helpers';

describe('extractObservation', () => {
  test('should extract observation value by key', () => {
    const entity: MCPEntity = {
      observations: ['key1:value1', 'key2:value2', 'key3:value3'],
    };

    expect(extractObservation(entity, 'key1')).toBe('value1');
    expect(extractObservation(entity, 'key2')).toBe('value2');
    expect(extractObservation(entity, 'key3')).toBe('value3');
  });

  test('should return null for non-existent key', () => {
    const entity: MCPEntity = {
      observations: ['key1:value1', 'key2:value2'],
    };

    expect(extractObservation(entity, 'nonexistent')).toBeNull();
  });

  test('should return null for entity without observations', () => {
    const entity = {};
    expect(extractObservation(entity, 'key1')).toBeNull();
  });

  test('should return null for null entity', () => {
    expect(extractObservation(null, 'key1')).toBeNull();
  });

  test('should handle observations with colons in values', () => {
    const entity: MCPEntity = {
      observations: ['url:https://example.com:8080/path', 'time:12:30:45'],
    };

    expect(extractObservation(entity, 'url')).toBe('https://example.com:8080/path');
    expect(extractObservation(entity, 'time')).toBe('12:30:45');
  });

  test('should handle empty observation values', () => {
    const entity: MCPEntity = {
      observations: ['empty:', 'normal:value'],
    };

    expect(extractObservation(entity, 'empty')).toBe('');
    expect(extractObservation(entity, 'normal')).toBe('value');
  });

  test('should handle observations without colons', () => {
    const entity: MCPEntity = {
      observations: ['key1:value1', 'invalid_observation', 'key2:value2'],
    };

    expect(extractObservation(entity, 'key1')).toBe('value1');
    expect(extractObservation(entity, 'key2')).toBe('value2');
    expect(extractObservation(entity, 'invalid_observation')).toBeNull();
  });
});

describe('createEntityName', () => {
  test('should create entity name with type and session', () => {
    const result = createEntityName('AnalysisSession', 'test-session-123');
    expect(result).toBe('AnalysisSession_test-session-123');
  });

  test('should create entity name with additional IDs', () => {
    const result = createEntityName('FileAnalysis', 'session-456', ['src/utils.ts']);
    expect(result).toBe('FileAnalysis_session-456_src/utils.ts');
  });

  test('should handle multiple additional IDs', () => {
    const result = createEntityName('GitWorktree', 'session-789', [
      'feature-branch',
      'worktree-path',
    ]);
    expect(result).toBe('GitWorktree_session-789_feature-branch_worktree-path');
  });

  test('should handle empty additional IDs', () => {
    const result = createEntityName('PullRequest', 'session-101', []);
    expect(result).toBe('PullRequest_session-101');
  });

  test('should sanitize special characters', () => {
    const result = createEntityName('FileAnalysis', 'session@123', ['src/file with spaces.ts']);
    expect(result).toBe('FileAnalysis_session@123_src/file with spaces.ts');
  });

  test('should work with all entity types', () => {
    const entityTypes: EntityType[] = [
      'AnalysisSession',
      'FileAnalysis',
      'GitWorktree',
      'PullRequest',
      'ArchitecturalPattern',
      'VercelOptimization',
      'MockAnalysis',
      'UtilizationAnalysis',
      'WordRemoval',
    ];

    entityTypes.forEach(type => {
      const result = createEntityName(type, 'test-session');
      expect(result).toBe(`${type}_test-session`);
    });
  });
});

describe('validateAgentRequest', () => {
  test('should validate valid request', () => {
    const request: AgentRequest = {
      version: '1.0',
      sessionId: 'test-session',
      action: 'analyze',
      data: { files: ['test.ts'] },
    };

    const result = validateAgentRequest(request, ['sessionId', 'action']);
    expect(result.valid).toBeTruthy();
    expect(result.errors).toStrictEqual([]);
  });

  test('should detect missing required fields', () => {
    const request = {
      version: '1.0',
      sessionId: 'test-session',
      // missing 'action'
    };

    const result = validateAgentRequest(request, ['sessionId', 'action']);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('Missing required field: action');
  });

  test('should detect multiple missing fields', () => {
    const request = {
      version: '1.0',
      // missing 'sessionId' and 'action'
    };

    const result = validateAgentRequest(request, ['sessionId', 'action']);
    expect(result.valid).toBeFalsy();
    expect(result.errors).toHaveLength(2);
    expect(result.errors).toContain('Missing required field: sessionId');
    expect(result.errors).toContain('Missing required field: action');
  });

  test('should validate version mismatch', () => {
    const request: AgentRequest = {
      version: '2.0',
      sessionId: 'test-session',
      action: 'analyze',
    };

    const result = validateAgentRequest(request, ['sessionId'], '1.0');
    expect(result.valid).toBeFalsy();
    expect(result.errors).toContain('Version mismatch: expected 1.0, got 2.0');
  });

  test('should handle null/undefined request', () => {
    const result1 = validateAgentRequest(null, ['sessionId']);
    expect(result1.valid).toBeFalsy();
    expect(result1.errors).toContain('Request is null or undefined');

    const result2 = validateAgentRequest(undefined, ['sessionId']);
    expect(result2.valid).toBeFalsy();
    expect(result2.errors).toContain('Request is null or undefined');
  });

  test('should handle empty required fields array', () => {
    const request: AgentRequest = {
      version: '1.0',
      sessionId: 'test-session',
      action: 'analyze',
    };

    const result = validateAgentRequest(request, []);
    expect(result.valid).toBeTruthy();
    expect(result.errors).toStrictEqual([]);
  });

  test('should validate with default version', () => {
    const request: AgentRequest = {
      version: '1.0',
      sessionId: 'test-session',
      action: 'analyze',
    };

    const result = validateAgentRequest(request, ['sessionId']);
    expect(result.valid).toBeTruthy();
  });
});

describe('formatAgentResponse', () => {
  test('should format successful response', () => {
    const response = formatAgentResponse(true, { result: 'analysis complete' });

    expect(response.success).toBeTruthy();
    expect(response.data).toStrictEqual({ result: 'analysis complete' });
    expect(response.error).toBeUndefined();
    expect(response.timestamp).toBeTypeOf('number');
  });

  test('should format error response', () => {
    const response = formatAgentResponse(false, undefined, 'Analysis failed');

    expect(response.success).toBeFalsy();
    expect(response.error).toBe('Analysis failed');
    expect(response.data).toBeUndefined();
    expect(response.timestamp).toBeTypeOf('number');
  });

  test('should format response with both data and error', () => {
    const response = formatAgentResponse(false, { partialResult: 'some data' }, 'Partial failure');

    expect(response.success).toBeFalsy();
    expect(response.data).toStrictEqual({ partialResult: 'some data' });
    expect(response.error).toBe('Partial failure');
  });

  test('should always include timestamp', () => {
    const before = Date.now();
    const response = formatAgentResponse(true);
    const after = Date.now();

    expect(response.timestamp).toBeGreaterThanOrEqual(before);
    expect(response.timestamp).toBeLessThanOrEqual(after);
  });

  test('should handle null/undefined data', () => {
    const response1 = formatAgentResponse(true, null);
    expect(response1.data).toBeNull();

    const response2 = formatAgentResponse(true, undefined);
    expect(response2.data).toBeUndefined();
  });

  test('should handle complex data objects', () => {
    const complexData = {
      files: ['file1.ts', 'file2.ts'],
      metrics: {
        coverage: 85,
        issues: 3,
      },
      timestamp: new Date(),
    };

    const response = formatAgentResponse(true, complexData);
    expect(response.data).toStrictEqual(complexData);
  });
});
