'use server';

import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@repo/observability';
import { NodeType } from '#/lib/prisma';
import { getChainStatus } from '#/lib/owlPost';
import {
  validateHookId,
  processWebhook,
  extractRequestInput,
} from '#/lib/webhooks';

/**
 * Handles incoming requests by validating the webhook and processing the input.
 * Measures and returns the total processing time.
 *
 * @param request - The incoming Next.js request.
 * @param params - Request parameters containing `hookId`.
 * @param method - HTTP method ('GET' | 'POST') for response messaging.
 * @returns A Next.js response with the processing result, chain ID, and processing time, or an error message.
 */
const handleRequest = async (
  request: NextRequest,
  params: Promise<{ hookId?: string }>,
  method: 'GET' | 'POST',
): Promise<Response> => {
  const startTime = Date.now();
  const { hookId } = await params;

  // Early return if hookId is undefined
  if (!hookId) {
    return new NextResponse(JSON.stringify({ message: 'hookId is required' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Use the extracted validateHookId function with the correct NodeType
  const { node, response } = await validateHookId(
    hookId,
    NodeType.webhookSource,
  );
  if (response) return response;

  try {
    // Use the extracted requestExtractor
    const input = await extractRequestInput(request);

    // Use the extracted processWebhook
    if (!node) {
      throw new Error('Node not found');
    }
    const chainId = await processWebhook(input, node);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const chainStatus = getChainStatus(chainId);
    const hasError = chainStatus?.status === 'error';
    const statusCode = hasError ? 422 : 200;

    return new NextResponse(
      JSON.stringify({
        message: hasError
          ? `Webhook processing failed: ${chainStatus.error}`
          : `${method} webhook processed for hookId: ${hookId}`,
        chainId,
        processingTime: `${processingTime}ms`,
        status: chainStatus?.status,
        chain: chainStatus,
      }),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    logError('Webhook processing error', { error });
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    return new NextResponse(
      JSON.stringify({
        message:
          error instanceof Error ? error.message : 'Webhook processing failed',
        processingTime: `${processingTime}ms`,
        status: 'error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};

/**
 * Handles GET requests to the webhook endpoint.
 * Processes query parameters as input data.
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ hookId?: string }> },
): Promise<Response> => handleRequest(request, params, 'GET');

/**
 * Handles POST requests to the webhook endpoint.
 * Processes request body as input data.
 */
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ hookId?: string }> },
): Promise<Response> => handleRequest(request, params, 'POST');
