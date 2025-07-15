import { NextRequest, NextResponse } from 'next/server';

interface RequestParams {
  params: Promise<{
    domain: string;
    cronId?: string;
  }>;
}

/**
 * Validates the presence of the cronId parameter.
 * @param {string | undefined} cronId - The cronId parameter from the URL.
 * @returns {NextResponse | null} - Returns a 404 response if cronId is missing, otherwise null.
 */
const validateHookId = (cronId?: string): NextResponse | null => {
  if (!cronId) {
    return new NextResponse(JSON.stringify({ message: 'cronId is required' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
};

/**
 * Handles GET requests to the webhook API endpoint.
 * @param {NextRequest} request - The incoming request object.
 * @param {RequestParams} params - The route parameters.
 * @returns {Promise<Response>} - The response to be sent back to the client.
 */
export async function GET(
  request: NextRequest,
  { params }: RequestParams,
): Promise<Response> {
  const resolvedParams = await params;
  const { domain, cronId } = resolvedParams;
  const validationResponse = validateHookId(cronId);

  if (validationResponse) {
    return validationResponse;
  }

  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  // Your GET request logic here
  return new NextResponse(
    JSON.stringify({
      message: `GET request received for domain: ${domain}, cronId: ${cronId}`,
      queryParams,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

/**
 * Handles POST requests to the webhook API endpoint.
 * @param {NextRequest} request - The incoming request object.
 * @param {RequestParams} params - The route parameters.
 * @returns {Promise<Response>} - The response to be sent back to the client.
 */
export async function POST(
  request: NextRequest,
  { params }: RequestParams,
): Promise<Response> {
  const resolvedParams = await params;
  const { domain, cronId } = resolvedParams;
  const validationResponse = validateHookId(cronId);

  if (validationResponse) {
    return validationResponse;
  }

  const body = await request.json();

  // Your POST request logic here
  return new NextResponse(
    JSON.stringify({
      message: `POST request received for domain: ${domain}, cronId: ${cronId}`,
      data: body,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
