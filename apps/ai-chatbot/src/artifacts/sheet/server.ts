import { sheetPrompt, updateDocumentPrompt } from '#/lib/ai/prompts';
import { myProvider } from '#/lib/ai/providers';
import { createDocumentHandler } from '#/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod/v4';

/**
 * Server-side document handler for sheet artifacts
 * Handles creation and updating of spreadsheet documents using AI CSV generation
 */
export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title }) => {
    const { object } = await streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: sheetPrompt,
      prompt: title,
      schema: z.object({
        csv: z.string().describe('CSV data'),
      }),
    });

    const result = await object;
    return result.csv;
  },
  onUpdateDocument: async ({ document, description }) => {
    const { object } = await streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'sheet'),
      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    const result = await object;
    return result.csv;
  },
});
