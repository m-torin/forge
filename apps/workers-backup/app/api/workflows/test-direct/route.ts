import { type NextRequest, NextResponse } from 'next/server';

// Direct test without using Upstash Workflow SDK
export async function POST(request: NextRequest) {
  console.log('[TEST-DIRECT] Received request');
  console.log('[TEST-DIRECT] Headers:', Object.fromEntries(request.headers.entries()));

  try {
    const body = await request.json().catch(() => ({}));
    console.log('[TEST-DIRECT] Body:', body);

    // Check if this is a workflow step
    const isWorkflowStep = request.headers.get('upstash-workflow-sdk-version');
    console.log('[TEST-DIRECT] Is workflow step:', isWorkflowStep);

    // Return success
    return NextResponse.json({
      isWorkflowStep,
      message: 'Direct test completed',
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[TEST-DIRECT] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
