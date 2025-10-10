// @ts-nocheck
import { sheetPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from '@repo/ai';
import { logError } from '@repo/observability';
import { z } from 'zod/v3';

export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const streamResult = await streamObject(
      [
        {
          role: 'system',
          parts: [{ type: 'text', text: sheetPrompt }],
        },
        { role: 'user', parts: [{ type: 'text', text: title }] },
      ],
      z.object({
        csv: z.string().describe('CSV data'),
      }),
      {
        model: myProvider.languageModel('artifact-model'),
      },
    );

    if (!streamResult.success || !streamResult.fullStream) {
      const reason =
        streamResult.error?.error instanceof Error
          ? streamResult.error.error
          : new Error('Unable to generate sheet document');
      logError('[Artifact/Sheet] Failed to generate document', reason);
      throw reason;
    }

    for await (const delta of streamResult.fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: 'data-sheetDelta',
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }

    dataStream.write({
      type: 'data-sheetDelta',
      data: draftContent,
      transient: true,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const streamResult = await streamObject(
      [
        {
          role: 'system',
          parts: [
            {
              type: 'text',
              text: updateDocumentPrompt(
                typeof document.content === 'string' ? document.content : '',
                'sheet',
              ),
            },
          ],
        },
        { role: 'user', parts: [{ type: 'text', text: description }] },
      ],
      z.object({
        csv: z.string(),
      }),
      {
        model: myProvider.languageModel('artifact-model'),
      },
    );

    if (!streamResult.success || !streamResult.fullStream) {
      const reason =
        streamResult.error?.error instanceof Error
          ? streamResult.error.error
          : new Error('Unable to update sheet document');
      logError('[Artifact/Sheet] Failed to update document', reason);
      throw reason;
    }

    for await (const delta of streamResult.fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.write({
            type: 'data-sheetDelta',
            data: csv,
            transient: true,
          });

          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});
