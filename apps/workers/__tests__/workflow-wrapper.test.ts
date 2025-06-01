import { describe, expect, it, vi } from 'vitest';
import type { WorkflowContext } from '@upstash/workflow';

import { wrapWorkflow } from '../app/workflows/workflow-wrapper';

// Helper to create a partial mock of WorkflowContext
const createMockContext = <T = any>(overrides: Partial<WorkflowContext<T>> = {}): any => ({
  requestPayload: {},
  workflowRunId: 'test-run-123',
  headers: new Headers(),
  env: {},
  run: vi.fn(),
  sleep: vi.fn(),
  sleepUntil: vi.fn(),
  call: vi.fn(),
  waitForEvent: vi.fn(),
  notify: vi.fn(),
  qstashClient: {} as any,
  ...overrides,
});

describe('Workflow Wrapper', () => {
  it('should wrap an enhanced workflow and pass context correctly', async () => {
    // Mock enhanced workflow
    const mockEnhancedWorkflow = vi.fn().mockResolvedValue({ success: true });
    
    // Create wrapped workflow
    const wrappedWorkflow = wrapWorkflow(mockEnhancedWorkflow);
    
    // Mock WorkflowContext
    const mockContext = createMockContext<{ test: string }>({
      requestPayload: { test: 'data' },
    });
    
    // Execute wrapped workflow
    const result = await wrappedWorkflow(mockContext);
    
    // Verify the enhanced workflow was called with the context
    expect(mockEnhancedWorkflow).toHaveBeenCalledWith(mockContext);
    expect(result).toEqual({ success: true });
  });

  it('should handle workflow errors properly', async () => {
    // Mock enhanced workflow that throws
    const mockError = new Error('Workflow failed');
    const mockEnhancedWorkflow = vi.fn().mockRejectedValue(mockError);
    
    // Create wrapped workflow
    const wrappedWorkflow = wrapWorkflow(mockEnhancedWorkflow);
    
    // Mock WorkflowContext
    const mockContext = createMockContext({
      workflowRunId: 'test-run-456',
    });
    
    // Execute wrapped workflow and expect it to throw
    await expect(wrappedWorkflow(mockContext)).rejects.toThrow('Workflow failed');
  });

  it('should preserve workflow payload types', async () => {
    interface TestPayload {
      userId: string;
      action: string;
      metadata?: Record<string, any>;
    }
    
    const mockEnhancedWorkflow = vi.fn().mockImplementation(async (ctx: any) => {
      // Verify payload structure
      expect(ctx.requestPayload).toHaveProperty('userId');
      expect(ctx.requestPayload).toHaveProperty('action');
      return { processed: true };
    });
    
    const wrappedWorkflow = wrapWorkflow<TestPayload>(mockEnhancedWorkflow);
    
    const mockContext = createMockContext<TestPayload>({
      requestPayload: {
        userId: 'user-123',
        action: 'test-action',
        metadata: { extra: 'data' },
      },
      workflowRunId: 'test-run-789',
    });
    
    const result = await wrappedWorkflow(mockContext);
    expect(result).toEqual({ processed: true });
    expect(mockEnhancedWorkflow).toHaveBeenCalledWith(mockContext);
  });

  it('should handle context with all properties', async () => {
    const mockEnhancedWorkflow = vi.fn().mockImplementation(async (ctx: any) => {
      // Verify all context properties are passed through
      expect(ctx).toHaveProperty('requestPayload');
      expect(ctx).toHaveProperty('workflowRunId');
      expect(ctx).toHaveProperty('headers');
      expect(ctx).toHaveProperty('env');
      expect(ctx).toHaveProperty('run');
      expect(ctx).toHaveProperty('sleep');
      expect(ctx).toHaveProperty('sleepUntil');
      expect(ctx).toHaveProperty('call');
      expect(ctx).toHaveProperty('waitForEvent');
      expect(ctx).toHaveProperty('notify');
      expect(ctx).toHaveProperty('qstashClient');
      return { allPropertiesPresent: true };
    });
    
    const wrappedWorkflow = wrapWorkflow(mockEnhancedWorkflow);
    
    const mockContext = createMockContext({
      requestPayload: { complex: { nested: 'data' } },
      workflowRunId: 'complex-run-123',
      headers: new Headers({ 'x-custom': 'header' }),
      env: { CUSTOM_ENV: 'value' },
      qstashClient: {
        publishJSON: vi.fn(),
        publish: vi.fn(),
      } as any,
    });
    
    const result = await wrappedWorkflow(mockContext);
    expect(result).toEqual({ allPropertiesPresent: true });
  });
});