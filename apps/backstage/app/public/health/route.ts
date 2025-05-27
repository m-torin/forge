import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
