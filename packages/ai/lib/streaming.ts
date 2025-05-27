import { generateObject, generateText, streamObject, streamText } from 'ai';
import { type z } from 'zod';

import { models } from './models';

// Re-export for convenience
export { models };

// Streaming text completion
export async function streamCompletion({
  maxTokens = 1000,
  prompt,
  system,
  temperature = 0.7,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return streamText({
    maxTokens,
    messages: [
      ...(system ? [{ content: system, role: 'system' as const }] : []),
      { content: prompt, role: 'user' as const },
    ],
    model: models.chat,
    temperature,
  });
}

// Non-streaming text generation
export async function generateCompletion({
  maxTokens = 1000,
  prompt,
  system,
  temperature = 0.7,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return generateText({
    maxTokens,
    messages: [
      ...(system ? [{ content: system, role: 'system' as const }] : []),
      { content: prompt, role: 'user' as const },
    ],
    model: models.chat,
    temperature,
  });
}

// Structured object generation
export async function generateStructuredData<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options?: {
    system?: string;
    temperature?: number;
    maxTokens?: number;
  },
) {
  return generateObject({
    maxTokens: options?.maxTokens ?? 1000,
    messages: [
      ...(options?.system ? [{ content: options.system, role: 'system' as const }] : []),
      { content: prompt, role: 'user' as const },
    ],
    model: models.chat,
    schema,
    temperature: options?.temperature ?? 0.7,
  });
}

// Streaming structured object generation
export async function streamStructuredData<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options?: {
    system?: string;
    temperature?: number;
    maxTokens?: number;
  },
) {
  return streamObject({
    maxTokens: options?.maxTokens ?? 1000,
    messages: [
      ...(options?.system ? [{ content: options.system, role: 'system' as const }] : []),
      { content: prompt, role: 'user' as const },
    ],
    model: models.chat,
    schema,
    temperature: options?.temperature ?? 0.7,
  });
}
