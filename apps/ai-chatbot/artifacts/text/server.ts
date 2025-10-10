// @ts-nocheck
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamText } from '@repo/ai';
import { logError } from '@repo/observability';
import { smoothStream } from 'ai';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const streamResult = await streamText(
      [
        {
          role: 'system',
          parts: [
            {
              type: 'text',
              text: 'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
            },
          ],
        },
        { role: 'user', parts: [{ type: 'text', text: title }] },
      ],
      {
        model: myProvider.languageModel('artifact-model'),
        experimental_transform: smoothStream({ chunking: 'word' }),
      },
    );

    if (!streamResult.success || !streamResult.fullStream) {
      const reason =
        streamResult.error?.error instanceof Error
          ? streamResult.error.error
          : new Error('Unable to generate document content');
      logError('[Artifact/Text] Failed to generate document', reason);
      throw reason;
    }

    for await (const delta of streamResult.fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: 'data-textDelta',
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const streamResult = await streamText(
      [
        {
          role: 'system',
          parts: [
            {
              type: 'text',
              text: updateDocumentPrompt(
                typeof document.content === 'string' ? document.content : '',
                'text',
              ),
            },
          ],
        },
        { role: 'user', parts: [{ type: 'text', text: description }] },
      ],
      {
        model: myProvider.languageModel('artifact-model'),
        experimental_transform: smoothStream({ chunking: 'word' }),
        providerOptions: {
          openai: {
            prediction: {
              type: 'content',
              content: typeof document.content === 'string' ? document.content : '',
            },
          },
        },
      },
    );

    if (!streamResult.success || !streamResult.fullStream) {
      const reason =
        streamResult.error?.error instanceof Error
          ? streamResult.error.error
          : new Error('Unable to update document content');
      logError('[Artifact/Text] Failed to update document', reason);
      throw reason;
    }

    for await (const delta of streamResult.fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { text } = delta;

        draftContent += text;

        dataStream.write({
          type: 'data-textDelta',
          data: text,
          transient: true,
        });
      }
    }

    return draftContent;
  },
});
