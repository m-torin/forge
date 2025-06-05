import { NextRequest, NextResponse } from 'next/server';

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
      success: response.ok,
      status: response.status,
      qstashUrl,
      hasToken: !!token,
      response: result,
      env: {
        QSTASH_URL: process.env.QSTASH_URL,
        UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });

    const result = await response.text();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result,
      published: {
        url: targetUrl,
        payload: { test: true },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
