// SEO Generation Workflow API Route
// Enhanced with AI-specific security and validation

import { serve } from '@upstash/workflow/nextjs';
import { z } from 'zod';
import { mainSeoWorkflow, processSeoGenerationBatch } from '@/workflows/seo-generation/workflow';
import { SeoWorkflowPayload } from '@/workflows/seo-generation/types';
import { SEO_CONFIG } from '@/workflows/seo-generation/config';

// Enhanced request validation schema for SEO workflows
const SeoWorkflowRequestSchema = z.object({
  trigger: z.enum(['manual', 'scheduled', 'child']),
  productIds: z.array(z.string()).optional(),
  limit: z.number().min(1).max(200).optional(),
  onlyMissing: z.boolean().optional(),
  regenerate: z.boolean().optional(),
  parentRunId: z.string().optional(),
  batchIndex: z.number().optional(),
  priorityBatch: z.boolean().optional(),
  progressWebhook: z.string().url().optional(),
  categoryFilter: z.string().optional(),
  brandFilter: z.string().optional(),
  seoStrategy: z.enum(['conversion', 'awareness', 'discovery']).optional(),
});

/**
 * Enhanced route handler for SEO generation workflows
 */
export const { POST } = serve<SeoWorkflowPayload>(
  async (context) => {
    const startTime = Date.now();

    try {
      // Log workflow start with AI-specific context
      console.log('Enhanced SEO generation workflow started', {
        workflowRunId: context.workflowRunId,
        trigger: context.requestPayload.trigger,
        productCount: context.requestPayload.productIds?.length || 0,
        priorityBatch: context.requestPayload.priorityBatch,
        seoStrategy: context.requestPayload.seoStrategy,
        timestamp: new Date().toISOString(),
      });

      // Validate request payload
      const validation = SeoWorkflowRequestSchema.safeParse(context.requestPayload);
      if (!validation.success) {
        throw new Error(`Invalid request payload: ${JSON.stringify(validation.error.errors)}`);
      }

      // Additional AI-specific validation
      if (
        context.requestPayload.limit &&
        context.requestPayload.limit > 100 &&
        context.requestPayload.trigger === 'manual'
      ) {
        throw new Error('Manual triggers limited to 100 products for cost control');
      }

      // Route to appropriate handler based on trigger type
      if (context.requestPayload.trigger === 'child') {
        return await processSeoGenerationBatch(context);
      }

      return await mainSeoWorkflow(context);
    } catch (error) {
      console.error('Enhanced SEO generation workflow error', {
        workflowRunId: context.workflowRunId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  },
  {
    retries: SEO_CONFIG.maxRetries,
  },
);
