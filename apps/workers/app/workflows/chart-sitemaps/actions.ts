'use server';

import { Client } from '@upstash/workflow';

import type { ChartSitemapsPayload } from './definition';

/**
 * Server action to trigger the chart sitemaps workflow
 */
export async function runChartSitemapsWorkflow(payload: ChartSitemapsPayload) {
  try {
    const client = new Client({
      baseUrl: process.env.UPSTASH_WORKFLOW_URL || process.env.QSTASH_URL,
      token: process.env.QSTASH_TOKEN!,
    });

    // Trigger the workflow
    const result = await client.trigger({
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3400'}/api/workflows/chart-sitemaps`,
      body: payload,
    });

    return {
      success: true,
      workflowRunId: result.workflowRunId,
      data: result,
    };
  } catch (error) {
    console.error('Failed to trigger workflow:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger workflow',
    };
  }
}