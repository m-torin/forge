import { auth } from '#/app/(auth)/auth';
import { db } from '#/lib/db';
import { ragChatConfig } from '#/lib/db/schema';
import { logError } from '@repo/observability';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod/v4';

const RAGConfigSchema = z.object({
  enabled: z.boolean(),
  similarityThreshold: z.number().min(0.1).max(1.0),
  maxResults: z.number().min(1).max(20),
  namespace: z.string().optional(),
  chunkSize: z.number().min(100).max(5000),
  autoActivate: z.boolean(),
  preferredCategories: z.array(z.string()).optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let chatId = 'unknown';
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    chatId = id;

    // Get existing configuration
    const config = await db.query.ragChatConfig.findFirst({
      where: eq(ragChatConfig.chatId, chatId),
    });

    if (!config) {
      // Return default configuration
      return NextResponse.json({
        enabled: false,
        similarityThreshold: 0.7,
        maxResults: 5,
        chunkSize: 1000,
        autoActivate: false,
      });
    }

    return NextResponse.json({
      enabled: config.isEnabled,
      similarityThreshold: parseFloat(config.similarityThreshold),
      maxResults: parseInt(config.maxResults),
      namespace: config.namespace,
      chunkSize: parseInt(config.chunkSize),
      autoActivate: false, // Default for now
    });
  } catch (error) {
    logError('Error fetching RAG config', { error, chatId });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let chatId = 'unknown';
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    chatId = id;
    const body = await request.json();

    const validationResult = RAGConfigSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid configuration',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const config = validationResult.data;

    // Check if configuration already exists
    const existingConfig = await db.query.ragChatConfig.findFirst({
      where: eq(ragChatConfig.chatId, chatId),
    });

    if (existingConfig) {
      // Update existing configuration
      await db
        .update(ragChatConfig)
        .set({
          isEnabled: config.enabled,
          similarityThreshold: config.similarityThreshold.toString(),
          maxResults: config.maxResults.toString(),
          chunkSize: config.chunkSize.toString(),
          namespace: config.namespace,
          updatedAt: new Date(),
        })
        .where(eq(ragChatConfig.chatId, chatId));
    } else {
      // Create new configuration
      await db.insert(ragChatConfig).values({
        chatId,
        isEnabled: config.enabled,
        similarityThreshold: config.similarityThreshold.toString(),
        maxResults: config.maxResults.toString(),
        chunkSize: config.chunkSize.toString(),
        namespace: config.namespace,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'RAG configuration updated successfully',
    });
  } catch (error) {
    logError('Error saving RAG config', { error, chatId });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let chatId = 'unknown';
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    chatId = id;

    // Delete configuration (resets to defaults)
    await db.delete(ragChatConfig).where(eq(ragChatConfig.chatId, chatId));

    return NextResponse.json({
      success: true,
      message: 'RAG configuration reset to defaults',
    });
  } catch (error) {
    logError('Error deleting RAG config', { error, chatId });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
