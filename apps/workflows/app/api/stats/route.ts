import { workflowService } from '@/lib';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stats = await workflowService.getWorkflowStats();

    return NextResponse.json({
      data: stats,
      success: true,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
        timestamp: new Date(),
      },
      { status: 500 },
    );
  }
}
