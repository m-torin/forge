/**
 * AI SDK v5 Agent Framework Tests
 * Comprehensive tests for the agent framework implementation
 */

import { openai } from '@ai-sdk/openai';
import { tool } from 'ai';
import { beforeEach, describe, expect, vi } from 'vitest';
import { z } from 'zod/v4';

// Import agent framework components
import {
  AgentOrchestrator,
  AgentValidator,
  agentUtils,
  createAgentControlStrategy,
  createResearchAgent,
  executeMultiStepAgent,
  hasToolCall,
  stepCountAtMost,
  stepCountIs,
  stopWhenPresets,
  textContains,
  type MultiStepConfig,
  type StepCondition,
} from '../../../src/server';

// Mock the AI SDK functions
vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
  generateObject: vi.fn(),
  streamObject: vi.fn(),
  tool: vi.fn(),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(),
}));

// Mock observability
vi.mock('@repo/observability/server/next', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

describe('agent Framework', () => {
  const mockModel = openai('gpt-4o');

  const mockTools = {
    testTool: tool({
      description: 'Test tool',
      inputSchema: z.object({ query: z.string() }),
      execute: vi.fn().mockResolvedValue({ result: 'test result' }),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('step Conditions', () => {
    test('should create step count condition', () => {
      const condition = stepCountIs(5);
      expect(typeof condition).toBe('function');

      const context = { stepNumber: 5, maxSteps: 10, steps: [], toolCalls: [], text: '' };
      expect(condition(context)).toBeTruthy();

      const contextFalse = { stepNumber: 3, maxSteps: 10, steps: [], toolCalls: [], text: '' };
      expect(condition(contextFalse)).toBeFalsy();
    });

    test('should create step count at most condition', () => {
      const condition = stepCountAtMost(5);
      expect(typeof condition).toBe('function');

      const context = { stepNumber: 5, maxSteps: 10, steps: [], toolCalls: [], text: '' };
      expect(condition(context)).toBeTruthy();

      const contextFalse = { stepNumber: 6, maxSteps: 10, steps: [], toolCalls: [], text: '' };
      expect(condition(contextFalse)).toBeTruthy();

      const contextTrue = { stepNumber: 3, maxSteps: 10, steps: [], toolCalls: [], text: '' };
      expect(condition(contextTrue)).toBeFalsy();
    });

    test('should create tool call condition', () => {
      const condition = hasToolCall('testTool');
      expect(typeof condition).toBe('function');

      const context = {
        stepNumber: 1,
        maxSteps: 10,
        steps: [],
        toolCalls: [{ toolName: 'testTool', args: {} }],
        text: '',
      };
      expect(condition(context)).toBeTruthy();

      const contextFalse = {
        stepNumber: 1,
        maxSteps: 10,
        steps: [],
        toolCalls: [{ toolName: 'otherTool', args: {} }],
        text: '',
      };
      expect(condition(contextFalse)).toBeFalsy();
    });

    test('should create text contains condition', () => {
      const condition = textContains('complete');
      expect(typeof condition).toBe('function');

      const context = {
        stepNumber: 1,
        maxSteps: 10,
        steps: [],
        toolCalls: [],
        text: 'Task is complete',
      };
      expect(condition(context)).toBeTruthy();

      const contextFalse = {
        stepNumber: 1,
        maxSteps: 10,
        steps: [],
        toolCalls: [],
        text: 'Task is ongoing',
      };
      expect(condition(contextFalse)).toBeFalsy();
    });

    test('should provide stop condition presets', () => {
      expect(stopWhenPresets.chatAgent).toBeDefined();
      expect(stopWhenPresets.taskAgent).toBeDefined();
      expect(stopWhenPresets.researchAgent).toBeDefined();
      expect(Array.isArray(stopWhenPresets.chatAgent)).toBeTruthy();
    });
  });

  describe('agent Controls', () => {
    test('should create agent control strategy', () => {
      const strategy = createAgentControlStrategy({
        phases: [
          {
            startStep: 0,
            endStep: 2,
            temperature: 0.5,
            system: 'Phase 1 system prompt',
          },
          {
            startStep: 3,
            temperature: 0.8,
            system: 'Phase 2 system prompt',
          },
        ],
      });

      expect(typeof strategy).toBe('function');

      // Test phase 1
      const phase1Result = strategy({ stepNumber: 1, maxSteps: 10, steps: [] });
      expect(phase1Result).toStrictEqual({
        temperature: 0.5,
        system: 'Phase 1 system prompt',
      });

      // Test phase 2
      const phase2Result = strategy({ stepNumber: 4, maxSteps: 10, steps: [] });
      expect(phase2Result).toStrictEqual({
        temperature: 0.8,
        system: 'Phase 2 system prompt',
      });

      // Test no matching phase
      const noPhaseResult = strategy({ stepNumber: 10, maxSteps: 10, steps: [] });
      expect(noPhaseResult).toBeUndefined();
    });
  });

  describe('multi-Step Execution', () => {
    beforeEach(() => {
      // Mock generateText to return successful result
      const mockGenerateText = vi.mocked(vi.importMock('ai').generateText);
      mockGenerateText.mockResolvedValue({
        text: 'Generated response',
        finishReason: 'stop',
        usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
        steps: [
          {
            text: 'Step 1 response',
            finishReason: 'tool-calls',
            usage: { totalTokens: 50, inputTokens: 25, outputTokens: 25 },
            toolCalls: [{ toolName: 'testTool', args: { query: 'test' } }],
          },
        ],
      });
    });

    test('should execute multi-step agent', async () => {
      const config: MultiStepConfig = {
        model: mockModel,
        tools: mockTools,
        maxSteps: 5,
        system: 'Test system prompt',
        temperature: 0.7,
      };

      const result = await executeMultiStepAgent('Test prompt', config);

      expect(result).toBeDefined();
      expect(result.finalResult).toBeDefined();
      expect(result.steps).toBeDefined();
      expect(Array.isArray(result.steps)).toBeTruthy();
      expect(typeof result.executionTime).toBe('number');
      expect(typeof result.totalTokensUsed).toBe('number');
      expect(typeof result.stoppedBy).toBe('string');
    });

    test('should handle execution errors gracefully', async () => {
      const mockGenerateText = vi.mocked(vi.importMock('ai').generateText);
      mockGenerateText.mockRejectedValue(new Error('Test error'));

      const config: MultiStepConfig = {
        model: mockModel,
        tools: mockTools,
        maxSteps: 5,
      };

      await expect(executeMultiStepAgent('Test prompt', config)).rejects.toThrow('Test error');
    });
  });

  describe('agent Orchestrator', () => {
    test('should create and register agents', () => {
      const orchestrator = new AgentOrchestrator();

      const agent = createResearchAgent('test-researcher', {
        model: mockModel,
        tools: mockTools,
      });

      orchestrator.registerAgent(agent);
      expect(orchestrator.getAgent('test-researcher')).toBe(agent);
      expect(orchestrator.listAgents()).toContain(agent);
    });

    test('should throw error for unknown agent', () => {
      const orchestrator = new AgentOrchestrator();
      expect(orchestrator.getAgent('unknown-agent')).toBeUndefined();
    });
  });

  describe('agent Patterns', () => {
    test('should create research agent', () => {
      const agent = createResearchAgent('test-researcher', {
        model: mockModel,
        tools: mockTools,
        customization: {
          maxSteps: 12,
          temperature: 0.6,
        },
      });

      expect(agent.id).toBe('test-researcher');
      expect(agent.name).toBe('Research Agent');
      expect(agent.model).toBe(mockModel);
      expect(agent.tools).toBe(mockTools);
      expect(agent.maxSteps).toBe(12);
      expect(agent.temperature).toBe(0.6);
      expect(agent.stopWhen).toBeDefined();
      expect(agent.experimental_prepareStep).toBeDefined();
    });

    test('should use default values when customization not provided', () => {
      const agent = createResearchAgent('default-researcher', {
        model: mockModel,
        tools: mockTools,
      });

      expect(agent.maxSteps).toBe(15);
      expect(agent.temperature).toBe(0.4);
      expect(agent.system).toContain('research agent');
    });
  });

  describe('agent Validation', () => {
    test('should validate valid agent configuration', () => {
      const config: MultiStepConfig = {
        model: mockModel,
        tools: mockTools,
        maxSteps: 10,
        temperature: 0.5,
        system: 'Valid system prompt',
      };

      const validation = AgentValidator.validateAgentConfig(config);
      expect(validation.valid).toBeTruthy();
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid agent configuration', () => {
      const config: MultiStepConfig = {
        model: null as any, // Invalid model
        tools: mockTools,
        maxSteps: -1, // Invalid maxSteps
        temperature: 5, // Invalid temperature
      };

      const validation = AgentValidator.validateAgentConfig(config);
      expect(validation.valid).toBeFalsy();
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain('Model is required');
      expect(validation.errors).toContain('maxSteps must be at least 1');
      expect(validation.errors).toContain('temperature must be between 0 and 2');
    });

    test('should provide warnings for suboptimal configuration', () => {
      const config: MultiStepConfig = {
        model: mockModel,
        tools: mockTools,
        maxSteps: 100, // High step count
        temperature: 0.5,
        system: 'x'.repeat(15000), // Very long system prompt
      };

      const validation = AgentValidator.validateAgentConfig(config);
      expect(validation.valid).toBeTruthy();
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('maxSteps'))).toBeTruthy();
      expect(validation.warnings.some(w => w.includes('system prompt'))).toBeTruthy();
    });

    test('should validate stop conditions', () => {
      const conditions: StepCondition[] = [
        stepCountAtMost(10),
        hasToolCall('testTool'),
        textContains('complete'),
      ];

      const validation = AgentValidator.validateStopConditions(conditions);
      expect(validation.valid).toBeTruthy();
      expect(validation.errors).toHaveLength(0);
    });

    test('should warn about missing stop conditions', () => {
      const validation = AgentValidator.validateStopConditions([]);
      expect(validation.valid).toBeTruthy();
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings[0]).toContain('No stop conditions');
    });
  });

  describe('agent Utilities', () => {
    test('should create simple config', () => {
      const config = agentUtils.createSimpleConfig(mockModel, mockTools, {
        maxSteps: 8,
        temperature: 0.6,
        system: 'Test system',
      });

      expect(config.model).toBe(mockModel);
      expect(config.tools).toBe(mockTools);
      expect(config.maxSteps).toBe(8);
      expect(config.temperature).toBe(0.6);
      expect(config.system).toBe('Test system');
    });

    test('should use defaults when options not provided', () => {
      const config = agentUtils.createSimpleConfig(mockModel, mockTools);

      expect(config.maxSteps).toBe(10);
      expect(config.temperature).toBe(0.5);
      expect(config.system).toBeUndefined();
    });
  });

  describe('integration Tests', () => {
    test('should execute complete agent workflow', async () => {
      // Mock successful execution
      const mockGenerateText = vi.mocked(vi.importMock('ai').generateText);
      mockGenerateText.mockResolvedValue({
        text: 'Research completed successfully',
        finishReason: 'stop',
        usage: { totalTokens: 200, inputTokens: 100, outputTokens: 100 },
        steps: [
          {
            text: 'Step 1: Planning research',
            finishReason: 'tool-calls',
            usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
            toolCalls: [{ toolName: 'testTool', args: { query: 'research plan' } }],
          },
          {
            text: 'Step 2: Research completed successfully',
            finishReason: 'stop',
            usage: { totalTokens: 100, inputTokens: 50, outputTokens: 50 },
            toolCalls: [],
          },
        ],
      });

      const orchestrator = new AgentOrchestrator();

      const researchAgent = createResearchAgent('integration-test', {
        model: mockModel,
        tools: mockTools,
        customization: {
          maxSteps: 5,
          stopConditions: [stepCountAtMost(5), textContains('completed successfully')],
        },
      });

      orchestrator.registerAgent(researchAgent);

      const result = await orchestrator.executeAgent(
        'integration-test',
        'Conduct research on AI ethics',
      );

      expect(result).toBeDefined();
      expect(result.finalResult.text).toContain('completed successfully');
      expect(result.steps).toHaveLength(2);
      expect(result.totalTokensUsed).toBe(200);
    });
  });
});
