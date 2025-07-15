import { logError, logInfo } from '@repo/observability/server/next';
import { createDataStream } from 'ai';
import { after } from 'next/server';
import { createResumableStreamContext, type ResumableStreamContext } from 'resumable-stream';

let globalStreamContext: ResumableStreamContext | null = null;

/**
 * Gets or creates a resumable stream context for Next.js
 * Uses Next.js `after()` for proper lifecycle management
 */
export function getResumableStreamContext(): ResumableStreamContext | null {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        logInfo('Resumable streams are disabled due to missing REDIS_URL', {
          operation: 'resumable_streams',
        });
      } else {
        logError(
          'Failed to create resumable stream context',
          error instanceof Error ? error : new Error(String(error)),
          { operation: 'resumable_streams' },
        );
      }
    }
  }

  return globalStreamContext;
}

/**
 * Creates a resumable stream response
 */
export async function createResumableStreamResponse(
  streamId: string,
  createStream: () => ReadableStream,
): Promise<Response> {
  const streamContext = getResumableStreamContext();

  if (streamContext) {
    const stream = await streamContext.resumableStream(streamId, createStream);
    return new Response(stream);
  } else {
    // Fallback to regular stream if resumable context not available
    return new Response(createStream());
  }
}

/**
 * Resumes an existing stream or returns empty data stream
 */
export async function resumeOrEmptyStream(streamId: string): Promise<ReadableStream | null> {
  const streamContext = getResumableStreamContext();

  if (!streamContext) {
    return null;
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  return streamContext.resumableStream(streamId, () => emptyDataStream);
}
