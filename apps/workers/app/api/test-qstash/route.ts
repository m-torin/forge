import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Test direct QStash CLI connection
  try {
    const qstashUrl = process.env.QSTASH_URL || 'http://localhost:8080';
    const token = process.env.QSTASH_TOKEN;

    // Try to get workflows from QStash CLI
    const response = await fetch(`${qstashUrl}/v2/workflows`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.text();

    return NextResponse.json({
      env: {
        NODE_ENV: process.env.NODE_ENV,
        QSTASH_URL: process.env.QSTASH_URL,
        UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
      },
      hasToken: !!token,
      qstashUrl,
      response: result,
      status: response.status,
      success: response.ok,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      suggestion: 'Make sure QStash CLI is running: npx @upstash/qstash-cli dev',
    });
  }
}

// Test publishing a simple message
export async function POST(request: NextRequest) {
  try {
    const qstashUrl = process.env.QSTASH_URL || 'http://localhost:8080';
    const token = process.env.QSTASH_TOKEN;

    // Try to publish to our simple workflow endpoint
    const targetUrl = `http://localhost:3400/api/workflows/simple`;

    const response = await fetch(`${qstashUrl}/v2/publish/${encodeURIComponent(targetUrl)}`, {
      body: JSON.stringify({ test: true }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const result = await response.text();

    return NextResponse.json({
      published: {
        url: targetUrl,
        payload: { test: true },
      },
      result,
      status: response.status,
      success: response.ok,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    });
  }
}
