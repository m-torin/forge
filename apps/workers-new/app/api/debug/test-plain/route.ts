import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[DEBUG] Plain API test called with:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Plain API test successful',
      receivedData: body,
      timestamp: Date.now(),
      server: 'workers-new'
    })
  } catch (error) {
    console.error('[DEBUG] Plain API test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Plain API test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Plain API GET test successful',
    timestamp: Date.now(),
    server: 'workers-new'
  })
}