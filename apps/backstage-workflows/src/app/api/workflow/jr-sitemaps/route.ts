import { serve } from '@upstash/workflow/nextjs';
import { z } from 'zod';
import { JrSitemapsWorkflowPayload } from '@/workflows/jr-sitemaps/types';
import { processSitemapBatch, mainJrSitemapsWorkflow } from '@/workflows/jr-sitemaps/workflow';
import { JR_SITEMAPS_CONFIG } from '@/workflows/jr-sitemaps/config';

// Request validation schema
const JrSitemapsWorkflowRequestSchema = z.object({
  trigger: z.enum(['manual', 'scheduled', 'child']),
  customSitemaps: z.array(z.string().url()).optional(),
  batchSize: z.number().min(100).max(5000).optional(),
  skipUnchanged: z.boolean().optional(),
  progressWebhook: z.string().url().optional(),
  parentRunId: z.string().optional(),
  batchIndex: z.number().optional(),
  isPriorityBatch: z.boolean().optional(),
});

/**
 * JR-Sitemaps workflow API route with Upstash Workflow integration
 */
export const { POST } = serve<JrSitemapsWorkflowPayload>(
  async (context) => {
    const startTime = Date.now();

    try {
      // Validate the request payload
      const validatedPayload = JrSitemapsWorkflowRequestSchema.parse(context.requestPayload);

      console.log('JR-Sitemaps workflow started', {
        workflowRunId: context.workflowRunId,
        trigger: validatedPayload.trigger,
        timestamp: new Date().toISOString(),
      });

      // Route to appropriate handler based on trigger type
      if (validatedPayload.trigger === 'child') {
        return await processSitemapBatch(context);
      }

      return await mainJrSitemapsWorkflow(context);
    } catch (error) {
      console.error('JR-Sitemaps workflow error', {
        workflowRunId: context.workflowRunId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  },
  {
    retries: JR_SITEMAPS_CONFIG.maxRetries,
  },
);
