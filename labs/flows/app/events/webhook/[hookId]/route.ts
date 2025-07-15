import { runFlowWebhookSource } from '#/lib/events/runWebhook';
import { NextRequest, NextResponse } from 'next/server';
import { logInfo } from '@repo/observability';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ hookId: string; domain: string }> },
) => {
  const { hookId } = await params;

  const response = await runFlowWebhookSource(hookId);

  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  logInfo(`GET request processed for hookId: ${hookId}`, { hookId, queryParams });

  return NextResponse.json({
    message: `GET request received for hookId: ${hookId}`,
    queryParams,
    data: { response },
  });
};

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ hookId: string; domain: string }> },
) => {
  const { hookId } = await params;
  const response = await runFlowWebhookSource(hookId);

  const body = await request.json();

  logInfo(`POST request processed for hookId: ${hookId}`, { hookId, body });

  return NextResponse.json({
    message: `POST request received for hookId: ${hookId}`,
    data: { response, request: body },
  });
};

// Ensure this route is not cached
export const dynamic = 'force-dynamic';
