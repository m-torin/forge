import { workflowService } from '@/lib';
import { type WorkflowStatus } from '@/types';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status') as WorkflowStatus;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    const result = await workflowService.getExecutions({
      endDate,
      limit,
      offset,
      startDate,
      status,
      workflowId: workflowId || undefined,
    });

    return NextResponse.json({
      data: result,
      success: true,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to get executions:', error);
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
