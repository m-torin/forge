// app/api/github/[hookId]/route.ts
'use server';

import { NextRequest } from 'next/server';
import { logError } from '@repo/observability';
import { NodeType } from '#/lib/prisma';
import {
  validateHookId,
  processWebhook,
  extractRequestInput,
} from '#/lib/webhooks';
import { getChainStatus } from '#/lib/owlPost';

interface GithubResponse {
  message: string;
  chainId?: string;
  processingTime: string;
  status: string;
  chain?: any;
}

/**
 * Processes a GitHub webhook request and returns appropriate response
 * Handles validation, processing, and error cases
 * Only allows POST requests as per GitHub webhook standards
 *
 * @param request - The incoming GitHub webhook request
 * @param input - The extracted request data
 * @param hookId - The ID of the webhook receiver node
 * @param startTime - Processing start timestamp
 * @returns Response object with processing results
 */
const processGithubWebhook = async (
  request: NextRequest,
  input: Record<string, any>,
  hookId: string,
  startTime: number,
): Promise<Response> => {
  try {
    const { node, response } = await validateHookId(
      hookId,
      NodeType.githubEventReceiverSource,
    );

    if (response) return response;

    // Process webhook and get chain status
    if (!node) {
      throw new Error('Node not found');
    }
    const chainId = await processWebhook(input, node);
    const chainStatus = getChainStatus(chainId);
    const processingTime = `${Date.now() - startTime}ms`;

    const hasError = chainStatus?.status === 'error';
    const responseBody: GithubResponse = {
      message: hasError
        ? `GitHub webhook processing failed: ${chainStatus.error}`
        : `GitHub webhook processed successfully`,
      chainId,
      processingTime,
      status: chainStatus?.status ?? 'unknown',
      chain: chainStatus,
    };

    return Response.json(responseBody, {
      status: hasError ? 422 : 200,
    });
  } catch (error) {
    logError('GitHub webhook processing error', { error });

    const responseBody: GithubResponse = {
      message:
        error instanceof Error
          ? error.message
          : 'GitHub webhook processing failed',
      processingTime: `${Date.now() - startTime}ms`,
      status: 'error',
    };

    return Response.json(responseBody, { status: 500 });
  }
};

/**
 * POST handler for GitHub webhook events
 * Validates GitHub signatures and processes webhook events
 *
 * @param request - The incoming GitHub webhook POST request
 * @param params - Route parameters containing hookId
 * @returns Response indicating processing status
 */
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ hookId?: string }> },
): Promise<Response> => {
  const startTime = Date.now();
  const { hookId } = await params;

  // Verify GitHub webhook signature
  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) {
    return Response.json(
      { message: 'Missing GitHub webhook signature' },
      { status: 401 },
    );
  }

  try {
    const input = await extractRequestInput(request);

    // Add GitHub specific metadata
    const githubEvent = request.headers.get('x-github-event');
    const githubDelivery = request.headers.get('x-github-delivery');

    const enrichedInput = {
      ...input,
      github: {
        event: githubEvent,
        delivery: githubDelivery,
        signature,
      },
    };

    return processGithubWebhook(request, enrichedInput, hookId || '', startTime);
  } catch (error) {
    logError('GitHub webhook extraction error', { error });
    return Response.json(
      {
        message: 'Failed to process GitHub webhook',
        processingTime: `${Date.now() - startTime}ms`,
        status: 'error',
      },
      { status: 500 },
    );
  }
};

/**
 * Verify this is a POST-only endpoint
 */
export const GET = async (): Promise<Response> => {
  return Response.json(
    { message: 'Only POST requests are allowed' },
    { status: 405 },
  );
};
