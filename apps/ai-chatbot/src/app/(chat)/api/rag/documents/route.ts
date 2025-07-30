import { auth } from '#/app/(auth)/auth';
import { isRAGEnabled } from '#/lib/ai/tools/rag/rag-tools';
import { db } from '#/lib/db';
import { ragChunk, ragDocument } from '#/lib/db/schema';
import { mockRAGKnowledgeBase, shouldUseMockRAG } from '#/lib/mock-data';
import { logError } from '@repo/observability';
import { and, desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic') === 'true';

    // Handle mock mode
    if (shouldUseMockRAG()) {
      const mockDocs = mockRAGKnowledgeBase.getDocuments();
      return NextResponse.json({
        documents: mockDocs,
        mode: 'mock',
        total: mockDocs.length,
      });
    }

    // Real mode: query from database
    const conditions = [];

    // User's own documents or public documents
    if (isPublic) {
      conditions.push(eq(ragDocument.isPublic, true));
    } else {
      conditions.push(eq(ragDocument.userId, session.user.id));
    }

    if (category && category !== 'all') {
      // Use JSON containment for category filtering
      conditions.push(sql`${ragDocument.metadata}->>'category' = ${category}`);
    }

    const documents = await (conditions.length > 0
      ? db
          .select()
          .from(ragDocument)
          .where(and(...conditions))
          .orderBy(desc(ragDocument.createdAt))
      : db.select().from(ragDocument).orderBy(desc(ragDocument.createdAt)));

    return NextResponse.json({
      documents,
      mode: 'real',
      total: documents.length,
    });
  } catch (error) {
    await logError('Error fetching RAG documents', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Handle mock mode
    if (shouldUseMockRAG()) {
      const success = mockRAGKnowledgeBase.deleteDocument(documentId);
      return NextResponse.json({
        success,
        message: success ? 'Document deleted successfully' : 'Document not found',
        mode: 'mock',
      });
    }

    // Real mode: check ownership
    const [document] = await db.select().from(ragDocument).where(eq(ragDocument.id, documentId));

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.userId !== session.user.id && !document.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from vector database if enabled
    if (isRAGEnabled()) {
      try {
        const { createRAGClient } = await import('#/lib/ai/rag-client');
        const { env } = await import('#/root/env');

        const vectorClient = await createRAGClient({
          vectorUrl: env.UPSTASH_VECTOR_REST_URL || '',
          vectorToken: env.UPSTASH_VECTOR_REST_TOKEN || '',
          namespace: `user_${document.userId}`,
        });

        // Get all chunks for this document
        const chunks = await db.select().from(ragChunk).where(eq(ragChunk.documentId, documentId));

        // Delete vectors by their IDs
        const vectorIds = chunks.map((_: any, index: number) => `${documentId}_chunk_${index}`);
        if (vectorIds.length > 0) {
          await vectorClient.delete(vectorIds);
        }
      } catch (vectorError) {
        await logError('Failed to delete vectors', { error: vectorError });
        // Continue with database deletion even if vector deletion fails
      }
    }

    // Delete from database (chunks will be cascade deleted)
    await db.delete(ragDocument).where(eq(ragDocument.id, documentId));

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      mode: 'real',
    });
  } catch (error) {
    await logError('Error deleting RAG document', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
