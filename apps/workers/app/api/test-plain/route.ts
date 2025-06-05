import { NextRequest, NextResponse } from 'next/server';

console.log('[TEST-PLAIN] Module loaded');

export async function POST(request: NextRequest) {
  console.log('[TEST-PLAIN] POST handler called');
  console.log('[TEST-PLAIN] Request method:', request.method);
  console.log('[TEST-PLAIN] Request URL:', request.url);
  console.log('[TEST-PLAIN] Headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    const body = await request.text();
    console.log('[TEST-PLAIN] Request body length:', body.length);
    console.log('[TEST-PLAIN] Request body preview:', body.substring(0, 200));
    
    // Just return a simple response
    return NextResponse.json({
      success: true,
      message: 'Plain test endpoint working',
      receivedBodyLength: body.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[TEST-PLAIN] Error:', error);
    return NextResponse.json({
      error: 'Plain test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  console.log('[TEST-PLAIN] GET handler called');
  return NextResponse.json({
    message: 'Plain test endpoint',
    description: 'Simple endpoint without any workflow SDK',
  });
}