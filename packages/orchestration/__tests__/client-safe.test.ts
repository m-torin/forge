import { describe, expect, it } from 'vitest';

// Test only client-safe utilities without importing full orchestration
import { WorkflowError, WorkflowErrorType } from '../src/utils/error-handling';
import { withResources } from '../src/utils/resource-management';

describe('Client-Safe Orchestration Utils', () => {
  describe('Workflow Error Handling', () => {
    it('should create WorkflowError instances', () => {
      const error = new WorkflowError(
        WorkflowErrorType.RATE_LIMIT,
        'Rate limit exceeded',
        { endpoint: '/api/test' },
        true,
        30000,
      );

      expect(error).toBeInstanceOf(WorkflowError);
      expect(error.type).toBe(WorkflowErrorType.RATE_LIMIT);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.context).toEqual({ endpoint: '/api/test' });
      expect(error.retryable).toBe(true);
      expect(error.retryAfter).toBe(30000);
    });

    it('should serialize WorkflowError to JSON', () => {
      const error = new WorkflowError(
        WorkflowErrorType.VALIDATION,
        'Validation failed',
        { field: 'email' },
        false,
      );

      const json = error.toJSON();
      expect(json).toHaveProperty('type', WorkflowErrorType.VALIDATION);
      expect(json).toHaveProperty('message', 'Validation failed');
      expect(json).toHaveProperty('context', { field: 'email' });
      expect(json).toHaveProperty('retryable', false);
      expect(json).toHaveProperty('stack');
    });
  });

  describe('Resource Management', () => {
    it('should manage resources and clean them up', async () => {
      let cleanupCalled = false;
      const cleanup = async () => {
        cleanupCalled = true;
      };

      await withResources(async (resources) => {
        const resource = { cleanup };
        resources.add(resource);
        return 'result';
      });

      expect(cleanupCalled).toBe(true);
    });

    it('should clean up resources even if an error occurs', async () => {
      let cleanupCalled = false;
      const cleanup = async () => {
        cleanupCalled = true;
      };

      await expect(
        withResources(async (resources) => {
          const resource = { cleanup };
          resources.add(resource);
          throw new Error('Test error');
        }),
      ).rejects.toThrow('Test error');

      expect(cleanupCalled).toBe(true);
    });
  });
});
