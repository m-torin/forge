import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
      QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY ? 'SET' : 'NOT SET',
      QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY ? 'SET' : 'NOT SET',
      QSTASH_TOKEN: process.env.QSTASH_TOKEN ? 'SET' : 'NOT SET',
      QSTASH_URL: process.env.QSTASH_URL,
      UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
    },
  });
}
