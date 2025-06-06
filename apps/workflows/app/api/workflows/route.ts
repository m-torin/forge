import { workflowService } from '@/lib';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    let workflows = await workflowService.getWorkflows();

    // Apply filters
    if (category) {
      workflows = await workflowService.getWorkflowsByCategory(category);
    } else if (tag) {
      workflows = await workflowService.getWorkflowsByTag(tag);
    } else if (search) {
      workflows = await workflowService.searchWorkflows(search);
    }

    return NextResponse.json({
      data: {
        total: workflows.length,
        workflows,
      },
      success: true,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to get workflows:', error);
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

export async function POST(request: NextRequest) {
  try {
    const { input, options, workflowId } = await request.json();

    if (!workflowId) {
      return NextResponse.json(
        {
          error: 'workflowId is required',
          success: false,
          timestamp: new Date(),
        },
        { status: 400 },
      );
    }

    const result = await workflowService.executeWorkflow(
      workflowId,
      input || {},
      { type: 'manual', payload: input || {}, triggeredBy: 'api' },
      options,
    );

    return NextResponse.json({
      data: result,
      success: true,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to execute workflow:', error);
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
