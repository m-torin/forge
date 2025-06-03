import { type ImportExternalMediaPayload } from '@/workflows/import-external-media/definition';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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
    const _payload: ImportExternalMediaPayload = {
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

    // Create workflow run
    const workflowRunId = `media-import-${Date.now()}`; // Mock for now

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
  return NextResponse.json({
    description: 'Import media files from external sources with processing and optimization',
    methods: ['POST'],
    optionalFields: ['processing', 'notifications', 'organizationId', 'dedupId'],
    requiredFields: ['sources', 'destination', 'userId'],
    version: '1.0.0',
    workflow: 'import-external-media',
  });
}
