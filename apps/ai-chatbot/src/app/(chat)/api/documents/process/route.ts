import { auth } from '#/app/(auth)/auth';
import { processDocumentForRAG, type DocumentMetadata } from '#/lib/ai/document-processing';
import { logError } from '@repo/observability';
import { NextResponse } from 'next/server';
import { z } from 'zod/v4';

const ProcessDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  originalFilename: z.string().min(1, 'Original filename is required'),
  fileSize: z.number().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  blobUrl: z.string().url('Invalid blob URL'),
  blobKey: z.string().min(1, 'Blob key is required'),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = ProcessDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const metadata: DocumentMetadata = {
      ...validationResult.data,
      uploadedBy: session.user.id,
    };

    // Process the document
    const result = await processDocumentForRAG(metadata);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Document processing failed',
          details: result.error,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      chunksCreated: result.chunksCreated,
      processingTime: result.processingTime,
      message: 'Document processed successfully and added to knowledge base',
    });
  } catch (error) {
    logError('Document processing API error', { error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Import here to avoid circular dependencies
    const { getDocumentProcessingStatus } = await import('#/lib/ai/document-processing');
    const status = await getDocumentProcessingStatus(documentId);

    return NextResponse.json(status);
  } catch (error) {
    logError('Document status API error', { error });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
