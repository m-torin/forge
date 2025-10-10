// @ts-nocheck
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from '@repo/ai';
import { logError } from '@repo/observability';
import { z } from 'zod/v3';

export const codeDocumentHandler = createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const streamResult = await streamObject(
      [
        {
          role: 'system',
          parts: [{ type: 'text', text: codePrompt }],
        },
        { role: 'user', parts: [{ type: 'text', text: title }] },
      ],
      z.object({
        code: z.string(),
      }),
      {
        model: myProvider.languageModel('artifact-model'),
      },
    );

    if (!streamResult.success || !streamResult.fullStream) {
      const reason =
        streamResult.error?.error instanceof Error
          ? streamResult.error.error
          : new Error('Unable to generate code document');
      logError('[Artifact/Code] Failed to generate document', reason);
      throw reason;
    }

    for await (const delta of streamResult.fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.write({
            type: 'data-codeDelta',
            data: code ?? '',
            transient: true,
          });

          draftContent = code;
        }
      }
    }

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
                'code',
              ),
            },
          ],
        },
        { role: 'user', parts: [{ type: 'text', text: description }] },
      ],
      z.object({
        code: z.string(),
      }),
      {
        model: myProvider.languageModel('artifact-model'),
      },
    );

    if (!streamResult.success || !streamResult.fullStream) {
      const reason =
        streamResult.error?.error instanceof Error
          ? streamResult.error.error
          : new Error('Unable to update code document');
      logError('[Artifact/Code] Failed to update document', reason);
      throw reason;
    }

    for await (const delta of streamResult.fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { code } = object;

        if (code) {
          dataStream.write({
            type: 'data-codeDelta',
            data: code ?? '',
            transient: true,
          });

          draftContent = code;
        }
      }
    }

    return draftContent;
  },
});
