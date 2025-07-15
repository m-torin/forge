import { z } from 'zod/v4';

/**
 * Validation schema for text message parts
 */
const textPartSchema = z.object({
  type: z.enum(['text']),
  text: z.string().min(1).max(2000),
});

/**
 * Validation schema for file message parts
 */
const filePartSchema = z.object({
  type: z.enum(['file']),
  mediaType: z.enum(['image/jpeg', 'image/png']),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

/**
 * Union schema for all message part types
 */
const partSchema = z.union([textPartSchema, filePartSchema]);

/**
 * Validation schema for POST request body to chat API
 */
export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(['user']),
    parts: z.array(partSchema),
  }),
  selectedChatModel: z.enum(['chat-model', 'chat-model-reasoning']),
  selectedVisibilityType: z.enum(['public', 'private']),
});

/**
 * Type inferred from POST request body schema
 */
export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
