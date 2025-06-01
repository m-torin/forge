import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../../app/api/workflows/[workflow]/route';

// Helper to create valid workflow metadata
const createMockMetadata = (id: string) => ({
  id,
  title: `Test ${id}`,
  description: `Test description for ${id}`,
  tags: ['test'],
  difficulty: 'beginner' as const,
  estimatedTime: '1 second',
  features: ['test'],
});

// Mock dependencies
vi.mock('../../app/workflows/loader', () => ({
  loadWorkflow: vi.fn(),
}));

vi.mock('@upstash/workflow/nextjs', () => ({
  serve: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('Workflow not found');
  }),
}));

describe('Workflow API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (process.env as any).NODE_ENV = 'test';
  });

  afterEach(() => {
    delete (process.env as any).NODE_ENV;
  });

  describe('POST /api/workflows/[workflow]', () => {
    it('should load and execute a valid workflow', async () => {
      const mockWorkflow = vi.fn().mockResolvedValue({ success: true });
      const mockDefinition = {
        metadata: {
          id: 'test-workflow',
          title: 'Test Workflow',
          description: 'Test workflow description',
          tags: ['test'],
          difficulty: 'beginner' as const,
          estimatedTime: '1 second',
          features: ['test'],
        },
        defaultPayload: {},
        workflow: mockWorkflow,
      };

      const mockHandler = {
        POST: vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: 'success' }))),
      };

      const { loadWorkflow } = await import('../../app/workflows/loader');
      const { serve } = await import('@upstash/workflow/nextjs');
      
      vi.mocked(loadWorkflow).mockResolvedValue(mockDefinition);
      vi.mocked(serve).mockReturnValue(mockHandler);

      const mockRequest = new Request('http://localhost:3400/api/workflows/test-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
      });

      const context = { params: Promise.resolve({ workflow: 'test-workflow' }) };
      
      const response = await POST(mockRequest, context);

      expect(loadWorkflow).toHaveBeenCalledWith('test-workflow');
      expect(serve).toHaveBeenCalledWith(mockDefinition.workflow, {
        retries: 3, // test mode is treated as production
        verbose: undefined,
      });
      expect(mockHandler.POST).toHaveBeenCalledWith(mockRequest);
      expect(response).toBe(await mockHandler.POST());
    });

    it('should return 404 for non-existent workflow', async () => {
      const { loadWorkflow } = await import('../../app/workflows/loader');
      vi.mocked(loadWorkflow).mockResolvedValue(null);

      const mockRequest = new Request('http://localhost:3400/api/workflows/non-existent', {
        method: 'POST',
      });

      const context = { params: Promise.resolve({ workflow: 'non-existent' }) };

      await expect(POST(mockRequest, context)).rejects.toThrow('Workflow not found');
      expect(loadWorkflow).toHaveBeenCalledWith('non-existent');
    });

    it('should use production settings when not in development', async () => {
      (process.env as any).NODE_ENV = 'production';

      const mockWorkflow = vi.fn();
      const mockDefinition = {
        metadata: createMockMetadata('prod-workflow'),
        defaultPayload: {},
        workflow: mockWorkflow,
      };

      const mockHandler = {
        POST: vi.fn().mockResolvedValue(new Response('OK')),
      };

      const { loadWorkflow } = await import('../../app/workflows/loader');
      const { serve } = await import('@upstash/workflow/nextjs');
      
      vi.mocked(loadWorkflow).mockResolvedValue(mockDefinition);
      vi.mocked(serve).mockReturnValue(mockHandler);

      const mockRequest = new Request('http://localhost:3400/api/workflows/prod-workflow', {
        method: 'POST',
      });

      const context = { params: Promise.resolve({ workflow: 'prod-workflow' }) };
      
      await POST(mockRequest, context);

      expect(serve).toHaveBeenCalledWith(mockDefinition.workflow, {
        retries: 3, // production mode
        verbose: undefined,
      });
    });

    it('should handle workflow execution errors', async () => {
      const mockError = new Error('Workflow execution failed');
      const mockWorkflow = vi.fn().mockRejectedValue(mockError);
      const mockDefinition = {
        metadata: createMockMetadata('error-workflow'),
        defaultPayload: {},
        workflow: mockWorkflow,
      };

      const mockHandler = {
        POST: vi.fn().mockRejectedValue(mockError),
      };

      const { loadWorkflow } = await import('../../app/workflows/loader');
      const { serve } = await import('@upstash/workflow/nextjs');
      
      vi.mocked(loadWorkflow).mockResolvedValue(mockDefinition);
      vi.mocked(serve).mockReturnValue(mockHandler);

      const mockRequest = new Request('http://localhost:3400/api/workflows/error-workflow', {
        method: 'POST',
      });

      const context = { params: Promise.resolve({ workflow: 'error-workflow' }) };

      await expect(POST(mockRequest, context)).rejects.toThrow('Workflow execution failed');
    });

    it('should pass request body to workflow', async () => {
      const mockWorkflow = vi.fn();
      const mockDefinition = {
        metadata: createMockMetadata('body-workflow'),
        defaultPayload: {},
        workflow: mockWorkflow,
      };

      const mockHandler = {
        POST: vi.fn().mockImplementation(async (req: Request) => {
          const body = await req.json();
          return new Response(JSON.stringify({ received: body }));
        }),
      };

      const { loadWorkflow } = await import('../../app/workflows/loader');
      const { serve } = await import('@upstash/workflow/nextjs');
      
      vi.mocked(loadWorkflow).mockResolvedValue(mockDefinition);
      vi.mocked(serve).mockReturnValue(mockHandler);

      const payload = { customData: 'test', items: [1, 2, 3] };
      const mockRequest = new Request('http://localhost:3400/api/workflows/body-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const context = { params: Promise.resolve({ workflow: 'body-workflow' }) };
      
      const response = await POST(mockRequest, context);
      const responseData = await response.json();

      expect(responseData).toEqual({ received: payload });
    });

    it('should handle different workflow IDs', async () => {
      const workflowIds = ['basic', 'kitchen-sink', 'image-processing'];
      const { loadWorkflow } = await import('../../app/workflows/loader');
      const { serve } = await import('@upstash/workflow/nextjs');

      for (const workflowId of workflowIds) {
        vi.clearAllMocks();

        const mockDefinition = {
          metadata: createMockMetadata(workflowId),
          defaultPayload: {},
          workflow: vi.fn(),
        };

        const mockHandler = {
          POST: vi.fn().mockResolvedValue(new Response('OK')),
        };

        vi.mocked(loadWorkflow).mockResolvedValue(mockDefinition);
        vi.mocked(serve).mockReturnValue(mockHandler);

        const mockRequest = new Request(`http://localhost:3400/api/workflows/${workflowId}`, {
          method: 'POST',
        });

        const context = { params: Promise.resolve({ workflow: workflowId }) };
        
        await POST(mockRequest, context);

        expect(loadWorkflow).toHaveBeenCalledWith(workflowId);
      }
    });

    it('should preserve request headers', async () => {
      const mockWorkflow = vi.fn();
      const mockDefinition = {
        metadata: createMockMetadata('header-workflow'),
        defaultPayload: {},
        workflow: mockWorkflow,
      };

      let capturedRequest: Request | null = null;
      const mockHandler = {
        POST: vi.fn().mockImplementation(async (req: Request) => {
          capturedRequest = req;
          return new Response('OK');
        }),
      };

      const { loadWorkflow } = await import('../../app/workflows/loader');
      const { serve } = await import('@upstash/workflow/nextjs');
      
      vi.mocked(loadWorkflow).mockResolvedValue(mockDefinition);
      vi.mocked(serve).mockReturnValue(mockHandler);

      const mockRequest = new Request('http://localhost:3400/api/workflows/header-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'test-value',
          'Authorization': 'Bearer token123',
        },
      });

      const context = { params: Promise.resolve({ workflow: 'header-workflow' }) };
      
      await POST(mockRequest, context);

      expect(capturedRequest).not.toBeNull();
      expect(capturedRequest!.headers.get('X-Custom-Header')).toBe('test-value');
      expect(capturedRequest!.headers.get('Authorization')).toBe('Bearer token123');
    });
  });

  describe('serve configuration', () => {
    it('should configure retries based on environment', async () => {
      const environments = [
        { NODE_ENV: 'development', expectedRetries: 1, expectedVerbose: true },
        { NODE_ENV: 'production', expectedRetries: 3, expectedVerbose: undefined },
        { NODE_ENV: 'test', expectedRetries: 3, expectedVerbose: undefined }, // test is treated as production
      ];

      const { loadWorkflow } = await import('../../app/workflows/loader');
      const { serve } = await import('@upstash/workflow/nextjs');

      for (const env of environments) {
        vi.clearAllMocks();
        (process.env as any).NODE_ENV = env.NODE_ENV;

        const mockDefinition = {
          metadata: createMockMetadata('env-workflow'),
          defaultPayload: {},
          workflow: vi.fn(),
        };

        vi.mocked(loadWorkflow).mockResolvedValue(mockDefinition);
        vi.mocked(serve).mockReturnValue({
          POST: vi.fn().mockResolvedValue(new Response('OK')),
        });

        const mockRequest = new Request('http://localhost:3400/api/workflows/env-workflow', {
          method: 'POST',
        });

        const context = { params: Promise.resolve({ workflow: 'env-workflow' }) };
        
        await POST(mockRequest, context);

        expect(serve).toHaveBeenCalledWith(mockDefinition.workflow, {
          retries: env.expectedRetries,
          verbose: env.expectedVerbose,
        });
      }
    });
  });
});