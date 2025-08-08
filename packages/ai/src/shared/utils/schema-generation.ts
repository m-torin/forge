import { z } from 'zod/v4';

/**
 * Vercel AI SDK schema generation utilities
 * Creates Zod schemas from model metadata following AI SDK patterns
 */

/**
 * Generate a Zod enum from model metadata objects
 * Following AI SDK patterns for model selection validation
 */
export function createModelIdEnum(...metadataObjects: Record<string, any>[]) {
  const allModelIds = metadataObjects.flatMap(metadata => Object.keys(metadata));

  if (allModelIds.length === 0) {
    throw new Error('At least one model ID is required for schema generation');
  }

  return z.enum(allModelIds as [string, ...string[]]);
}

/**
 * Create a chat request schema following AI SDK conventions
 * Standard schema for chat completion requests with model selection
 */
export function createChatRequestSchema(modelIdEnum: ReturnType<typeof createModelIdEnum>) {
  const textPartSchema = z.object({
    text: z.string().min(1).max(2000),
    type: z.enum(['text']),
  });

  const filePartSchema = z.object({
    url: z.string(), // URL in v5
    mediaType: z.string(), // mediaType in v5
    type: z.enum(['file']),
  });

  const messagePartSchema = z.union([textPartSchema, filePartSchema]);

  return z.object({
    id: z.string().uuid(),
    message: z.object({
      id: z.string().uuid(),
      createdAt: z.coerce.date(),
      role: z.enum(['user']),
      content: z.string().min(1).max(2000),
      parts: z.array(messagePartSchema),
    }),
    selectedChatModel: modelIdEnum,
    selectedVisibilityType: z.enum(['public', 'private']),
  });
}

/**
 * Utility to extract all available model IDs from metadata
 * Useful for debugging and validation
 */
export function extractModelIds(...metadataObjects: Record<string, any>[]): string[] {
  return metadataObjects.flatMap(metadata => Object.keys(metadata));
}
