import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
