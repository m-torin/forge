import { codePrompt, updateDocumentPrompt } from '#/lib/ai/prompts';
import { myProvider } from '#/lib/ai/providers';
import { createDocumentHandler } from '#/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod/v4';

/**
 * Server-side document handler for code artifacts
 * Handles creation and updating of code documents using AI
 */
export const codeDocumentHandler = createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({ title }) => {
    const { object } = await streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: codePrompt,
      prompt: title,
      schema: z.object({
        code: z.string(),
      }),
    });

    const result = await object;
    return result.code;
  },
  onUpdateDocument: async ({ document, description }) => {
    const { object } = await streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'code'),
      prompt: description,
      schema: z.object({
        code: z.string(),
      }),
    });

    const result = await object;
    return result.code;
  },
});
