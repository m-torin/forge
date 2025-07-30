import { myProvider } from '#/lib/ai/providers';
import { createDocumentHandler } from '#/lib/artifacts/server';
import { experimental_generateImage as generateImage } from 'ai';

/**
 * Server-side document handler for image artifacts
 * Handles creation and updating of image documents using AI image generation
 */
export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title }) => {
    const { image } = await generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });

    return image.base64;
  },
  onUpdateDocument: async ({ description }) => {
    const { image } = await generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: description,
      n: 1,
    });

    return image.base64;
  },
});
