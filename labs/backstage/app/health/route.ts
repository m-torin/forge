import { type NextRequest } from 'next/server';

export const runtime = 'edge'; // Changed back to edge since no auth needed
export const dynamic = 'force-dynamic';

export const GET = async (_request: NextRequest): Promise<Response> => {
  return new Response('OK', { status: 200 });
};
