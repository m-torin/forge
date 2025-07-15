/**
 * Integration tests for Code Quality Analysis workflow
 */
import { createCodeQualityWorkflow, workflowPresets } from '@/server/tools';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock MCP client
vi.mock('@/server/tools/code-quality/mcp-client', () => ({
  mcpClient: {
    createSession: vi.fn(),
    getSession: vi.fn(),
    storeResult: vi.fn(),
    getSessionResults: vi.fn(),
  },
}));

// Mock file system operations
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
}));

// Mock spawn for git operations
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('code Quality Analysis Integration', () => {
  let sessionId: string;

  beforeEach(() => {
    sessionId = `test-session-${Date.now()}`;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should create workflow with default configuration', () => {
    const workflow = createCodeQualityWorkflow();

    expect(workflow.tools).toBeDefined();
    expect(workflow.stopWhen).toBeDefined();
    expect(workflow.experimental_prepareStep).toBeDefined();
    expect(workflow.onStepFinish).toBeDefined();
    expect(workflow.experimental_repairToolCall).toBeDefined();

    // Check that all expected tools are present
    const toolNames = Object.keys(workflow.tools);
    expect(toolNames).toContain('createWorktree');
    expect(toolNames).toContain('discoverFiles');
    expect(toolNames).toContain('analyzePatterns');
    expect(toolNames).toContain('analyzeCode');
    expect(toolNames).toContain('optimizeForVercel');
    expect(toolNames).toContain('generateReport');
    expect(toolNames).toContain('createPullRequest');
  });

  test('should use quick preset configuration', () => {
    const workflow = createCodeQualityWorkflow(workflowPresets.quick);

    expect(workflow.config.maxSteps).toBe(6);
    expect(workflow.config.maxDuration).toBe(300000); // 5 minutes
    expect(workflow.config.createPR).toBeFalsy();
    expect(workflow.config.analysisConfig.eslint).toBeFalsy();
    expect(workflow.config.analysisConfig.vercelOptimizations).toBeFalsy();
  });

  test('should use comprehensive preset configuration', () => {
    const workflow = createCodeQualityWorkflow(workflowPresets.comprehensive);

    expect(workflow.config.maxSteps).toBe(10);
    expect(workflow.config.maxDuration).toBe(900000); // 15 minutes
    expect(workflow.config.createPR).toBeFalsy();
    expect(workflow.config.analysisConfig.eslint).toBeTruthy();
    expect(workflow.config.analysisConfig.vercelOptimizations).toBeTruthy();
  });

  test('should use automated preset configuration', () => {
    const workflow = createCodeQualityWorkflow(workflowPresets.automated);

    expect(workflow.config.maxSteps).toBe(12);
    expect(workflow.config.maxDuration).toBe(1200000); // 20 minutes
    expect(workflow.config.createPR).toBeTruthy();
    expect(workflow.config.analysisConfig.targetBranch).toBe('main');
  });

  test('should handle progressive tool unlocking', async () => {
    const workflow = createCodeQualityWorkflow();

    // Step 0: Should start with worktree creation
    const step0 = await workflow.experimental_prepareStep({ stepNumber: 0, steps: [] });
    expect(step0.toolChoice).toStrictEqual({ type: 'tool', toolName: 'createWorktree' });
    expect(step0.activeTools).toStrictEqual(['createWorktree']);

    // Step 1: After worktree creation, should discover files
    const step1 = await workflow.experimental_prepareStep({
      stepNumber: 1,
      steps: [
        {
          toolCalls: [{ toolName: 'createWorktree', toolCallId: '1', args: {} }],
          toolResults: [],
        },
      ],
    });
    expect(step1.toolChoice).toStrictEqual({ type: 'tool', toolName: 'discoverFiles' });
    expect(step1.activeTools).toStrictEqual(['discoverFiles']);
  });

  test('should handle stopping conditions', () => {
    const workflow = createCodeQualityWorkflow({ maxSteps: 5 });

    // Test step count stopping condition
    const stepCountStop = workflow.stopWhen.find(
      condition => typeof condition === 'object' && 'evaluate' in condition,
    );

    expect(stepCountStop).toBeDefined();
  });

  test('should handle tool repair for common failures', async () => {
    const workflow = createCodeQualityWorkflow();

    // Test worktree creation repair
    const repairedWorktreeCall = await workflow.experimental_repairToolCall({
      toolCall: {
        toolName: 'createWorktree',
        toolCallId: '1',
        args: { sessionId: 'test-session' },
      },
      error: new Error('Worktree already exists'),
      tools: workflow.tools,
      attempt: 1,
    });

    expect(repairedWorktreeCall).toBeDefined();
    expect(repairedWorktreeCall.args.sessionId).toContain('retry');

    // Test code analysis repair
    const repairedAnalysisCall = await workflow.experimental_repairToolCall({
      toolCall: {
        toolName: 'analyzeCode',
        toolCallId: '2',
        args: { options: { typescript: true, complexity: true } },
      },
      error: new Error('TypeScript analysis failed'),
      tools: workflow.tools,
      attempt: 1,
    });

    expect(repairedAnalysisCall).toBeDefined();
    expect(repairedAnalysisCall.args.options.typescript).toBeFalsy();
    expect(repairedAnalysisCall.args.options.complexity).toBeTruthy();
  });

  test('should validate tool schemas', () => {
    const workflow = createCodeQualityWorkflow();

    // Test that each tool has required properties
    Object.entries(workflow.tools).forEach(([toolName, tool]) => {
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.execute).toBeDefined();

      // Check that experimental_toToolResultContent is present for better UX
      expect(tool.experimental_toToolResultContent).toBeDefined();
    });
  });

  // Note: Full end-to-end test would require actual AI model and file system
  // This is a placeholder for integration testing structure
  test.skip('should execute full workflow end-to-end', async () => {
    const workflow = createCodeQualityWorkflow(workflowPresets.quick);

    // This would be the actual integration test with a real model
    // const result = await generateText({
    //   model: openai('gpt-4'),
    //   prompt: 'Analyze the code quality of the current package',
    //   tools: workflow.tools,
    //   stopWhen: workflow.stopWhen,
    //   experimental_prepareStep: workflow.experimental_prepareStep,
    //   onStepFinish: workflow.onStepFinish,
    //   experimental_repairToolCall: workflow.experimental_repairToolCall
    // });

    expect(workflow).toBeDefined();
  });
});
