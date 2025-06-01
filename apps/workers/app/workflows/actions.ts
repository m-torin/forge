'use server';

import { Client } from '@upstash/workflow';

/**
 * Server action to run any workflow dynamically
 */
export async function runWorkflow(workflowId: string, payload: any) {
  try {
    const client = new Client({
      baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
      token: process.env.QSTASH_TOKEN!,
    });

    // Trigger the workflow using the dynamic route
    // Use the window.location.origin in client context or fallback to process.env
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3400';

    // Ensure the baseUrl doesn't have a trailing slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const workflowPath = `/api/workflows/${workflowId}`;
    const workflowUrl = `${cleanBaseUrl}${workflowPath}`;

    console.log('Base URL:', cleanBaseUrl);
    console.log('Workflow Path:', workflowPath);
    console.log('Full URL:', workflowUrl);

    const result = await client.trigger({
      url: workflowUrl,
      body: payload,
    });

    return {
      data: result,
      success: true,
      workflowRunId: result.workflowRunId,
    };
  } catch (error) {
    console.error(`Failed to trigger workflow ${workflowId}:`, error);
    return {
      error: error instanceof Error ? error.message : 'Failed to trigger workflow',
      success: false,
    };
  }
}
