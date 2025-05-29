import { Client } from '@upstash/workflow';

import { devLog } from '../../utils/observability';
import { getDomain, normalizeUrl } from '../../utils/helpers';

/**
 * Start local QStash server for development
 */
export async function startLocalQStash() {
  devLog.info('Starting local QStash server...');
  devLog.info('Run: npx @upstash/qstash-cli dev');
  devLog.info('');
  devLog.info('Add to your .env.local:');
  devLog.info('QSTASH_URL=http://127.0.0.1:8080');
  devLog.info('QSTASH_TOKEN=<LOCAL_TOKEN_FROM_CLI>');
  devLog.info('');
  devLog.info('For production-like testing with ngrok:');
  devLog.info('1. Start ngrok: ngrok http 3000');
  devLog.info('2. Set UPSTASH_WORKFLOW_URL=https://your-ngrok-url.ngrok.io');
}

/**
 * Create a workflow client for local development
 */
export function createLocalWorkflowClient(options?: { token?: string; baseUrl?: string }) {
  const qstashUrl = process.env.QSTASH_URL || '';
  const domain = getDomain(qstashUrl);
  const isLocalDev = domain === '127.0.0.1' || domain === 'localhost';

  if (isLocalDev) {
    devLog.info('🚀 Using local QStash server for development');
  }

  const baseUrl = options?.baseUrl || process.env.QSTASH_URL;
  
  return new Client({
    baseUrl: baseUrl ? normalizeUrl(baseUrl) : undefined,
    token: options?.token || process.env.QSTASH_TOKEN!,
  });
}

/**
 * Helper to trigger workflows in local development
 */
export async function triggerLocalWorkflow(
  workflowUrl: string,
  payload: unknown,
  options?: {
    headers?: Record<string, string>;
    workflowRunId?: string;
  },
) {
  const client = createLocalWorkflowClient();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullUrl = workflowUrl.startsWith('http')
    ? normalizeUrl(workflowUrl)
    : normalizeUrl(`${baseUrl}${workflowUrl}`);

  const { workflowRunId } = await client.trigger({
    url: fullUrl,
    body: payload,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    retries: 3,
    workflowRunId: options?.workflowRunId,
  });

  devLog.info(`Workflow triggered: ${workflowRunId}`);
  devLog.info(`View in QStash dashboard or check local server logs`);

  return workflowRunId;
}

/**
 * Local development configuration helper
 */
export function getLocalDevConfig() {
  const isLocal = process.env.NODE_ENV === 'development';
  const hasLocalQStash = process.env.QSTASH_URL?.includes('127.0.0.1');

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    hasLocalQStash,
    isLocal,
    qstashUrl: process.env.QSTASH_URL || 'http://127.0.0.1:8080',
    recommendations: {
      useLocalQStash: isLocal && !process.env.QSTASH_TOKEN?.startsWith('qstash_'),
      useNgrok: isLocal && process.env.QSTASH_TOKEN?.startsWith('qstash_'),
    },
  };
}
