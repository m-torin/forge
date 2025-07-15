/**
 * Tests for Agentic Tools
 */

import { beforeEach, describe, expect, vi } from 'vitest';
import { z } from 'zod/v4';
import {
  AgenticPatterns,
  agenticTool,
  commonAgenticTools,
  createAgentWorkflow,
  StepHistoryTracker,
  StoppingConditions,
} from '../../../src/server/tools/agentic-tools';

describe('stepHistoryTracker', () => {
  let tracker: StepHistoryTracker;

  beforeEach(() => {
    tracker = new StepHistoryTracker();
  });

  test('should track step history correctly', () => {
    const step = {
      text: 'Test text',
      toolCalls: [{ toolName: 'test', args: {} }],
      toolResults: [{ toolName: 'test', result: 'success' }],
      finishReason: 'tool-calls',
      usage: { tokens: 100 },
    };

    tracker.addStep(step);

    expect(tracker.getStepCount()).toBe(1);
    expect(tracker.getHistory()).toStrictEqual([step]);
    expect(tracker.getAllToolCalls()).toStrictEqual(step.toolCalls);
    expect(tracker.getAllToolResults()).toStrictEqual(step.toolResults);
  });

  test('should clear history', () => {
    tracker.addStep({
      text: 'test',
      toolCalls: [],
      toolResults: [],
      finishReason: 'stop',
      usage: {},
    });

    tracker.clear();

    expect(tracker.getStepCount()).toBe(0);
    expect(tracker.getHistory()).toStrictEqual([]);
  });
});

describe('agenticTool', () => {
  test('should create an agentic tool with basic functionality', () => {
    const mockExecute = vi.fn().mockResolvedValue({ result: 'success' });

    const tool = agenticTool({
      description: 'Test tool',
      parameters: z.object({
        input: z.string(),
      }),
      execute: mockExecute,
      maxSteps: 3,
      trackHistory: true,
    });

    expect(tool).toBeDefined();
    expect(tool.agenticConfig).toBeDefined();
    expect(tool.stepHistory).toBeInstanceOf(StepHistoryTracker);
    expect(tool.agenticConfig.maxSteps).toBe(3);
  });

  test('should execute with context', async () => {
    const mockExecute = vi.fn().mockResolvedValue({ result: 'success' });

    const tool = agenticTool({
      description: 'Test tool',
      parameters: z.object({
        input: z.string(),
      }),
      execute: mockExecute,
      trackHistory: true,
    });

    const result = await tool.execute(
      { input: 'test' },
      {
        toolCallId: 'test-id',
        messages: [],
        abortSignal: new AbortController().signal,
      },
    );

    expect(mockExecute).toHaveBeenCalledWith(
      { input: 'test' },
      expect.objectContaining({
        stepNumber: 0,
        toolCallId: 'test-id',
        messages: [],
      }),
    );
    expect(result).toStrictEqual({ result: 'success' });
  });

  test('should call lifecycle hooks', async () => {
    const onStepStart = vi.fn();
    const mockExecute = vi.fn().mockResolvedValue({ result: 'success' });

    const tool = agenticTool({
      description: 'Test tool',
      parameters: z.object({
        input: z.string(),
      }),
      execute: mockExecute,
      hooks: {
        onStepStart,
      },
    });

    await tool.execute({ input: 'test' }, {});

    expect(onStepStart).toHaveBeenCalledWith();
  });

  test('should track history when enabled', async () => {
    const tool = agenticTool({
      description: 'Test tool',
      parameters: z.object({
        input: z.string(),
      }),
      execute: async () => ({ result: 'success' }),
      trackHistory: true,
    });

    await tool.execute({ input: 'test' }, {});

    expect(tool.stepHistory.getStepCount()).toBe(1);
    expect(tool.stepHistory.getAllToolCalls()).toHaveLength(1);
    expect(tool.stepHistory.getAllToolResults()).toHaveLength(1);
  });

  test('should support multi-modal results', () => {
    const tool = agenticTool({
      description: 'Test tool',
      parameters: z.object({
        input: z.string(),
      }),
      execute: async () => ({ image: 'base64data' }),
      experimental_toToolResultContent: result => ({
        type: 'image',
        data: result.image,
        mediaType: 'image/png',
      }),
    });

    expect(tool.experimental_toToolResultContent).toBeDefined();
  });
});

describe('stoppingConditions', () => {
  test('should create afterSteps condition', () => {
    const condition = StoppingConditions.afterSteps(5);
    expect(condition).toBeDefined();
  });

  test('should create whenToolCalled condition', () => {
    const condition = StoppingConditions.whenToolCalled('test');
    expect(condition).toBeDefined();
  });

  test('should create maxTokens condition', () => {
    const condition = StoppingConditions.maxTokens(1000);
    expect(condition).toBeDefined();

    // Test evaluation
    const shouldStop = condition.evaluate({
      steps: [{ usage: { totalTokens: 800 } }, { usage: { totalTokens: 300 } }],
    });
    expect(shouldStop).toBeTruthy();
  });

  test('should create whenTextContains condition', () => {
    const condition = StoppingConditions.whenTextContains('COMPLETE');
    expect(condition).toBeDefined();

    // Test evaluation
    const shouldStop = condition.evaluate({
      steps: [{ text: 'Working on task...' }, { text: 'Task COMPLETE' }],
    });
    expect(shouldStop).toBeTruthy();
  });

  test('should create afterDuration condition', () => {
    const condition = StoppingConditions.afterDuration(100);
    expect(condition).toBeDefined();

    // Test immediate evaluation (should be false)
    const shouldStop = condition.evaluate({ steps: [] });
    expect(shouldStop).toBeFalsy();
  });
});

describe('createAgentWorkflow', () => {
  test('should create workflow with default configuration', () => {
    const workflow = createAgentWorkflow({
      tools: {
        test: agenticTool({
          description: 'Test',
          parameters: z.object({}),
          execute: async () => ({}),
        }),
      },
    });

    expect(workflow.tools).toBeDefined();
    expect(workflow.maxSteps).toBe(5);
    expect(workflow.stopWhen).toBeDefined();
    expect(workflow.onStepFinish).toBeDefined();
    expect(workflow.getStepHistory).toBeDefined();
    expect(workflow.getAllToolCalls).toBeDefined();
    expect(workflow.getAllToolResults).toBeDefined();
  });

  test('should track step history through onStepFinish', async () => {
    const workflow = createAgentWorkflow({
      tools: {},
      maxSteps: 3,
    });

    await workflow.onStepFinish({
      text: 'test',
      toolCalls: [{ toolName: 'test', args: {} }],
      toolResults: [{ toolName: 'test', result: 'success' }],
      finishReason: 'stop',
      usage: { tokens: 100 },
    });

    expect(workflow.getStepHistory()).toHaveLength(1);
    expect(workflow.getAllToolCalls()).toHaveLength(1);
  });

  test('should call user hooks in onStepFinish', async () => {
    const userHook = vi.fn();

    const workflow = createAgentWorkflow({
      tools: {},
      hooks: {
        onStepFinish: userHook,
      },
    });

    await workflow.onStepFinish({
      text: 'test',
      toolCalls: [],
      toolResults: [],
      finishReason: 'stop',
      usage: {},
    });

    expect(userHook).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'test',
        stepNumber: 1,
      }),
    );
  });

  test('should handle experimental_prepareStep', async () => {
    const prepareStep = vi.fn().mockResolvedValue({
      toolChoice: { type: 'tool', toolName: 'test' },
    });

    const workflow = createAgentWorkflow({
      tools: {},
      hooks: {
        experimental_prepareStep: prepareStep,
      },
    });

    if (workflow.experimental_prepareStep) {
      const result = await workflow.experimental_prepareStep({
        stepNumber: 1,
        maxSteps: 5,
        messages: [],
      });

      expect(prepareStep).toHaveBeenCalledWith();
      expect(result).toStrictEqual({
        toolChoice: { type: 'tool', toolName: 'test' },
      });
    }
  });
});

describe('agenticPatterns', () => {
  describe('sequential', () => {
    test('should create sequential workflow', () => {
      const tools = [
        agenticTool({
          description: 'Step 1',
          parameters: z.object({}),
          execute: async () => ({ step: 1 }),
        }),
        agenticTool({
          description: 'Step 2',
          parameters: z.object({}),
          execute: async () => ({ step: 2 }),
        }),
      ];

      const workflow = AgenticPatterns.sequential(tools);

      expect(workflow.tools).toBeDefined();
      expect(Object.keys(workflow.tools)).toStrictEqual(['step0', 'step1']);
      expect(workflow.stopWhen).toBeDefined();
      expect(workflow.hooks?.experimental_prepareStep).toBeDefined();
    });

    test('should prepare correct step in sequence', async () => {
      const tools = [
        agenticTool({
          description: 'Step 1',
          parameters: z.object({}),
          execute: async () => ({ step: 1 }),
        }),
      ];

      const workflow = AgenticPatterns.sequential(tools);

      if (workflow.hooks?.experimental_prepareStep) {
        const result = await workflow.hooks.experimental_prepareStep({
          stepNumber: 0,
          maxSteps: 5,
          steps: [],
          messages: [],
        });

        expect(result).toStrictEqual({
          toolChoice: { type: 'tool', toolName: 'step0' },
        });
      }
    });
  });

  describe('conditional', () => {
    test('should create conditional workflow', () => {
      const evaluator = agenticTool({
        description: 'Evaluate',
        parameters: z.object({ input: z.string() }),
        execute: async () => ({ branch: 'option1' }),
      });

      const branches = {
        option1: agenticTool({
          description: 'Option 1',
          parameters: z.object({}),
          execute: async () => ({ result: 'option1' }),
        }),
      };

      const workflow = AgenticPatterns.conditional({
        evaluator,
        branches,
      });

      expect(workflow.tools).toBeDefined();
      expect(workflow.tools.evaluate).toBe(evaluator);
      expect(workflow.tools.option1).toBe(branches.option1);
    });
  });

  describe('retryWithRefinement', () => {
    test('should create retry workflow', () => {
      const tool = agenticTool({
        description: 'Main tool',
        parameters: z.object({}),
        execute: async () => ({ success: false }),
      });

      const validator = agenticTool({
        description: 'Validator',
        parameters: z.object({ result: z.any() }),
        execute: async () => ({ valid: false }),
      });

      const workflow = AgenticPatterns.retryWithRefinement({
        tool,
        validator,
        maxRetries: 2,
      });

      expect(workflow.tools).toBeDefined();
      expect(workflow.tools.execute).toBe(tool);
      expect(workflow.tools.validate).toBe(validator);
      expect(workflow.stopWhen).toBeDefined();
    });
  });
});

describe('commonAgenticTools', () => {
  test('should provide planningTool', () => {
    const tool = commonAgenticTools.planningTool;
    expect(tool).toBeDefined();
    expect(tool.agenticConfig.description).toContain('Break down');
  });

  test('should execute planningTool', async () => {
    const tool = commonAgenticTools.planningTool;
    const result = await tool.execute({
      task: 'Build a web app',
      constraints: ['Budget: $10k'],
    });

    expect(result).toMatchObject({
      steps: expect.arrayContaining([
        expect.objectContaining({
          step: expect.any(Number),
          action: expect.any(String),
          description: expect.any(String),
        }),
      ]),
      estimatedDuration: expect.any(String),
      constraints: ['Budget: $10k'],
    });
  });

  test('should provide validationTool', () => {
    const tool = commonAgenticTools.validationTool;
    expect(tool).toBeDefined();
    expect(tool.agenticConfig.description).toContain('Validate');
  });

  test('should execute validationTool', async () => {
    const tool = commonAgenticTools.validationTool;
    const result = await tool.execute({
      result: { data: 'test' },
      criteria: ['Complete', 'Accurate'],
    });

    expect(result).toMatchObject({
      valid: expect.any(Boolean),
      checks: expect.arrayContaining([
        expect.objectContaining({
          criterion: expect.any(String),
          passed: expect.any(Boolean),
          feedback: expect.any(String),
        }),
      ]),
      summary: expect.any(String),
    });
  });

  test('should provide refinementTool', () => {
    const tool = commonAgenticTools.refinementTool;
    expect(tool).toBeDefined();
    expect(tool.agenticConfig.description).toContain('Refine');
  });

  test('should execute refinementTool', async () => {
    const tool = commonAgenticTools.refinementTool;
    const result = await tool.execute({
      original: { data: 'original' },
      feedback: 'Needs improvement',
      iteration: 2,
    });

    expect(result).toMatchObject({
      refined: expect.objectContaining({
        refined: true,
        iteration: 2,
      }),
      improvements: expect.any(Array),
      confidence: expect.any(Number),
    });
    expect(result.confidence).toBeGreaterThan(0.85);
  });

  test('should support multi-modal results in refinementTool', () => {
    const tool = commonAgenticTools.refinementTool;
    expect(tool.experimental_toToolResultContent).toBeDefined();

    const result = { refined: true, data: 'test' };
    const content = tool.experimental_toToolResultContent!(result);

    expect(content).toStrictEqual({
      type: 'text',
      text: JSON.stringify(result, null, 2),
    });
  });
});

describe('integration Tests', () => {
  test('should work with workflow and common tools', async () => {
    const workflow = createAgentWorkflow({
      tools: {
        plan: commonAgenticTools.planningTool,
        validate: commonAgenticTools.validationTool,
      },
      maxSteps: 3,
      stopWhen: StoppingConditions.afterSteps(3),
    });

    // Simulate step execution
    await workflow.onStepFinish({
      text: 'Planning step complete',
      toolCalls: [{ toolName: 'plan', args: { task: 'test' } }],
      toolResults: [
        {
          toolName: 'plan',
          result: { steps: [{ step: 1, action: 'Test' }] },
        },
      ],
      finishReason: 'tool-calls',
      usage: { tokens: 100 },
    });

    expect(workflow.getStepHistory()).toHaveLength(1);
    expect(workflow.getAllToolCalls()[0].toolName).toBe('plan');
  });

  test('should handle complex multi-step workflow', async () => {
    const stepTracker = new StepHistoryTracker();

    // Simulate a complex workflow
    const steps = [
      { toolName: 'research', result: { findings: ['data1', 'data2'] } },
      { toolName: 'analyze', result: { insights: ['insight1'] } },
      { toolName: 'report', result: { document: 'final.pdf' } },
    ];

    steps.forEach((step, index) => {
      stepTracker.addStep({
        text: `Step ${index + 1} complete`,
        toolCalls: [{ toolName: step.toolName, args: {} }],
        toolResults: [{ toolName: step.toolName, result: step.result }],
        finishReason: 'tool-calls',
        usage: { tokens: 50 * (index + 1) },
      });
    });

    expect(stepTracker.getStepCount()).toBe(3);
    expect(stepTracker.getAllToolCalls().map(tc => tc.toolName)).toStrictEqual([
      'research',
      'analyze',
      'report',
    ]);

    const allResults = stepTracker.getAllToolResults();
    expect(allResults).toHaveLength(3);
    expect(allResults[2].result).toStrictEqual({ document: 'final.pdf' });
  });
});
