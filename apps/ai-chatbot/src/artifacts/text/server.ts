import { updateDocumentPrompt } from '#/lib/ai/prompts';
import { myProvider } from '#/lib/ai/providers';
import { createDocumentHandler } from '#/lib/artifacts/server';
import { defaultStreamTransform } from '@repo/ai/server';
import { streamText } from 'ai';

/**
 * Server-side document handler for text artifacts
 * Handles creation and updating of text documents using AI text generation
 */
export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title }) => {
    const { text } = await streamText({
      model: myProvider.languageModel('artifact-model'),
      system:
        'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
      experimental_transform: defaultStreamTransform,
      prompt: title,
    });

    return text;
  },
  onUpdateDocument: async ({ document, description }) => {
    const { text } = await streamText({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'text'),
      experimental_transform: defaultStreamTransform,
      prompt: description,
      providerOptions: {
        openai: {
          prediction: {
            type: 'content',
            content: document.content,
          },
        },
      },
    });

    return text;
  },
});
