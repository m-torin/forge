/**
 * Tests for agent utility MCP tools
 */
import { describe, it, expect } from 'vitest';
import {
  extractObservationTool,
  createEntityNameTool,
  validateAgentRequestTool,
  formatAgentResponseTool
} from '../../src/tools/agent-utilities';

describe('extractObservationTool', () => {
  it('should have correct tool definition', () => {
    expect(extractObservationTool.name).toBe('extract_observation');
    expect(extractObservationTool.description).toContain('MCP memory entity');
    expect(extractObservationTool.inputSchema).toBeDefined();
    expect(extractObservationTool.execute).toBeTypeOf('function');
  });

  it('should extract observation value', async () => {
    const entity = {
      observations: ['key1:value1', 'key2:value2']
    };
    
    const result = await extractObservationTool.execute({
      entity,
      key: 'key1'
    });
    
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('value1');
  });

  it('should return null for non-existent key', async () => {
    const entity = {
      observations: ['key1:value1']
    };
    
    const result = await extractObservationTool.execute({
      entity,
      key: 'nonexistent'
    });
    
    expect(result.content[0].text).toBe('null');
  });

  it('should handle entity without observations', async () => {
    const result = await extractObservationTool.execute({
      entity: {},
      key: 'key1'
    });
    
    expect(result.content[0].text).toBe('null');
  });

  it('should handle values with colons', async () => {
    const entity = {
      observations: ['url:https://example.com:8080/path']
    };
    
    const result = await extractObservationTool.execute({
      entity,
      key: 'url'
    });
    
    expect(result.content[0].text).toBe('https://example.com:8080/path');
  });

  it('should handle errors gracefully', async () => {
    const result = await extractObservationTool.execute({
      entity: null,
      key: 'key1'
    });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('error');
  });
});

describe('createEntityNameTool', () => {
  it('should have correct tool definition', () => {
    expect(createEntityNameTool.name).toBe('create_entity_name');
    expect(createEntityNameTool.description).toContain('standardized entity name');
    expect(createEntityNameTool.inputSchema).toBeDefined();
    expect(createEntityNameTool.execute).toBeTypeOf('function');
  });

  it('should create basic entity name', async () => {
    const result = await createEntityNameTool.execute({
      entityType: 'AnalysisSession',
      sessionId: 'test-session-123'
    });
    
    expect(result.content[0].text).toBe('AnalysisSession_test-session-123');
  });

  it('should create entity name with additional IDs', async () => {
    const result = await createEntityNameTool.execute({
      entityType: 'FileAnalysis',
      sessionId: 'session-456',
      additionalIds: ['src/utils.ts', 'typescript']
    });
    
    expect(result.content[0].text).toBe('FileAnalysis_session-456_src/utils.ts_typescript');
  });

  it('should handle empty additional IDs', async () => {
    const result = await createEntityNameTool.execute({
      entityType: 'GitWorktree',
      sessionId: 'session-789',
      additionalIds: []
    });
    
    expect(result.content[0].text).toBe('GitWorktree_session-789');
  });

  it('should validate entity types', async () => {
    const validTypes = [
      'AnalysisSession',
      'FileAnalysis', 
      'GitWorktree',
      'PullRequest',
      'ArchitecturalPattern',
      'VercelOptimization',
      'MockAnalysis',
      'UtilizationAnalysis',
      'WordRemoval'
    ];

    for (const entityType of validTypes) {
      const result = await createEntityNameTool.execute({
        entityType: entityType as any,
        sessionId: 'test-session'
      });
      
      expect(result.content[0].text).toBe(`${entityType}_test-session`);
    }
  });

  it('should handle errors gracefully', async () => {
    const result = await createEntityNameTool.execute({
      entityType: 'FileAnalysis',
      sessionId: null as any
    });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('error');
  });
});

describe('validateAgentRequestTool', () => {
  it('should have correct tool definition', () => {
    expect(validateAgentRequestTool.name).toBe('validate_agent_request');
    expect(validateAgentRequestTool.description).toContain('agent request format');
    expect(validateAgentRequestTool.inputSchema).toBeDefined();
    expect(validateAgentRequestTool.execute).toBeTypeOf('function');
  });

  it('should validate valid request', async () => {
    const request = {
      version: '1.0',
      sessionId: 'test-session',
      action: 'analyze',
      data: { files: ['test.ts'] }
    };
    
    const result = await validateAgentRequestTool.execute({
      request,
      requiredFields: ['sessionId', 'action']
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.valid).toBe(true);
    expect(parsed.errors).toEqual([]);
  });

  it('should detect missing required fields', async () => {
    const request = {
      version: '1.0',
      sessionId: 'test-session'
      // missing 'action'
    };
    
    const result = await validateAgentRequestTool.execute({
      request,
      requiredFields: ['sessionId', 'action']
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors).toContain('Missing required field: action');
  });

  it('should validate version mismatch', async () => {
    const request = {
      version: '2.0',
      sessionId: 'test-session',
      action: 'analyze'
    };
    
    const result = await validateAgentRequestTool.execute({
      request,
      requiredFields: ['sessionId'],
      version: '1.0'
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors).toContain('Version mismatch: expected 1.0, got 2.0');
  });

  it('should handle null request', async () => {
    const result = await validateAgentRequestTool.execute({
      request: null,
      requiredFields: ['sessionId']
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.valid).toBe(false);
    expect(parsed.errors).toContain('Request is null or undefined');
  });

  it('should use default version', async () => {
    const request = {
      version: '1.0',
      sessionId: 'test-session'
    };
    
    const result = await validateAgentRequestTool.execute({
      request,
      requiredFields: ['sessionId']
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.valid).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const result = await validateAgentRequestTool.execute({
      request: 'invalid' as any,
      requiredFields: ['sessionId']
    });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('error');
  });
});

describe('formatAgentResponseTool', () => {
  it('should have correct tool definition', () => {
    expect(formatAgentResponseTool.name).toBe('format_agent_response');
    expect(formatAgentResponseTool.description).toContain('standardized agent response');
    expect(formatAgentResponseTool.inputSchema).toBeDefined();
    expect(formatAgentResponseTool.execute).toBeTypeOf('function');
  });

  it('should format successful response', async () => {
    const result = await formatAgentResponseTool.execute({
      success: true,
      data: { result: 'analysis complete' }
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({ result: 'analysis complete' });
    expect(parsed.error).toBeUndefined();
    expect(parsed.timestamp).toBeTypeOf('number');
  });

  it('should format error response', async () => {
    const result = await formatAgentResponseTool.execute({
      success: false,
      error: 'Analysis failed'
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBe('Analysis failed');
    expect(parsed.data).toBeUndefined();
    expect(parsed.timestamp).toBeTypeOf('number');
  });

  it('should format response with both data and error', async () => {
    const result = await formatAgentResponseTool.execute({
      success: false,
      data: { partialResult: 'some data' },
      error: 'Partial failure'
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.success).toBe(false);
    expect(parsed.data).toEqual({ partialResult: 'some data' });
    expect(parsed.error).toBe('Partial failure');
  });

  it('should include timestamp', async () => {
    const before = Date.now();
    
    const result = await formatAgentResponseTool.execute({
      success: true
    });
    
    const after = Date.now();
    const parsed = JSON.parse(result.content[0].text);
    
    expect(parsed.timestamp).toBeGreaterThanOrEqual(before);
    expect(parsed.timestamp).toBeLessThanOrEqual(after);
  });

  it('should handle null data', async () => {
    const result = await formatAgentResponseTool.execute({
      success: true,
      data: null
    });
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.data).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const result = await formatAgentResponseTool.execute({
      success: null as any
    });
    
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('error');
  });
});