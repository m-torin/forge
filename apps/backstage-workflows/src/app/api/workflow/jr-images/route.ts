import { NextRequest, NextResponse } from 'next/server';
import { serve } from '@upstash/workflow/nextjs';
import { mainJrImageWorkflow, processJrImageBatch } from '@/workflows/jr-images/workflow';
import { JrImagesWorkflowPayload } from '@/workflows/jr-images/types';
import { JR_IMAGES_CONFIG } from '@/workflows/jr-images/config';

/**
 * Main route handler with Upstash Workflow integration for JR-Images
 */
export const { POST } = serve<JrImagesWorkflowPayload>(
  async (context) => {
    const startTime = Date.now();

    try {
      // Log workflow start
      console.log('JR-Images workflow started', {
        workflowRunId: context.workflowRunId,
        trigger: context.requestPayload.trigger,
        batchSize: context.requestPayload.batchSize,
        priorityBatch: context.requestPayload.priorityBatch,
        timestamp: new Date().toISOString(),
      });

      // Route to appropriate handler based on trigger type
      if (context.requestPayload.trigger === 'child') {
        return await processJrImageBatch(context);
      }

      return await mainJrImageWorkflow(context);
    } catch (error) {
      console.error('JR-Images workflow error', {
        workflowRunId: context.workflowRunId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  },
  {
    retries: JR_IMAGES_CONFIG.maxRetries,
  },
);

// OPTIONS handler for CORS
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
