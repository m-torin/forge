import { loadWorkflow } from '@/workflows/loader';
// import { isDevelopment } from '@repo/orchestration';
// import { workflows as workflowBuilders } from '@repo/orchestration/server';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { serve } from '@upstash/workflow/nextjs';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { slug } = params;

    // Handle special case for import-external-media (custom implementation)
    if (slug === 'import-external-media') {
      return handleImportExternalMedia(request);
    }

    // Load workflow definition using your existing loader
    const definition = await loadWorkflow(slug);

    if (!definition || !definition.workflow) {
      console.error(`Workflow not found for slug: ${slug}`);
      notFound();
    }

    // Simple development-only handler using base Upstash Workflow SDK
    console.log(`[WORKFLOW-${slug}] Creating simple handler`);
    console.log(`[WORKFLOW-${slug}] Environment:`, {
      QSTASH_URL: process.env.QSTASH_URL,
      NODE_ENV: process.env.NODE_ENV,
      UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
    });

    // Use serve directly with minimal config - no orchestration package
    const handler = serve(definition.workflow, {
      // Minimal configuration for testing
      receiver: undefined,
      verbose: true,
    });

    console.log(`[WORKFLOW-${slug}] Handler created, executing...`);
    return handler.POST(request);
  } catch (error) {
    console.error('Workflow execution error:', error);

    // Add more detailed error information in development
    if (isDevelopment()) {
      return NextResponse.json(
        {
          error: 'Workflow execution failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: {
            slug,
            isDevelopment: true,
            qstashUrl: process.env.QSTASH_URL || 'Not set - should use http://localhost:8080',
            hasSigningKeys: !!(
              process.env.QSTASH_CURRENT_SIGNING_KEY || process.env.QSTASH_NEXT_SIGNING_KEY
            ),
            stack: error instanceof Error ? error.stack : undefined,
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: 'Workflow execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Handle import-external-media workflow (custom implementation)
async function handleImportExternalMedia(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.sources || !Array.isArray(body.sources) || body.sources.length === 0) {
      return NextResponse.json(
        { error: 'Sources array is required and must not be empty' },
        { status: 400 },
      );
    }

    if (!body.destination || !body.destination.type || !body.destination.path) {
      return NextResponse.json(
        { error: 'Destination with type and path is required' },
        { status: 400 },
      );
    }

    if (!body.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Set default values for optional fields
    const payload = {
      dedupId: body.dedupId,
      destination: body.destination,
      notifications: {
        onFailure: body.notifications?.onFailure ?? [],
        onSuccess: body.notifications?.onSuccess ?? [],
        webhook: body.notifications?.webhook,
      },
      organizationId: body.organizationId,
      processing: {
        autoResize: body.processing?.autoResize ?? false,
        extractMetadata: body.processing?.extractMetadata ?? true,
        generateThumbnails: body.processing?.generateThumbnails ?? true,
        optimizeForWeb: body.processing?.optimizeForWeb ?? false,
        virusScan: body.processing?.virusScan ?? true,
        ...body.processing,
      },
      sources: body.sources,
      userId: body.userId,
    };

    // Create workflow run (mock implementation for now)
    const workflowRunId = `media-import-${Date.now()}`;

    return NextResponse.json({
      message: 'Import External Media workflow triggered successfully',
      success: true,
      workflowRunId,
    });
  } catch (error) {
    console.error('Failed to trigger Import External Media workflow:', error);

    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to trigger workflow',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  const { getAvailableWorkflows } = await import('@/workflows/loader');
  return NextResponse.json({
    message: 'Dynamic workflow endpoint',
    availableWorkflows: getAvailableWorkflows(),
  });
}
