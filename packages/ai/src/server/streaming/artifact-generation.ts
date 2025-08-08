import type { LanguageModel, UIMessageStreamWriter } from 'ai';
import { smoothStream, streamText } from 'ai';

/**
 * Configuration for artifact generation
 */
export interface ArtifactGenerationConfig {
  /** Model to use for generation */
  model: LanguageModel;
  /** System prompt for the generation */
  systemPrompt: string;
  /** User prompt/input */
  prompt: string;
  /** Existing content for updates (optional) */
  existingContent?: string;
  /** Chunking strategy for smooth streaming */
  chunking?: 'word' | 'line';
  /** OpenAI prediction metadata for faster generation */
  enablePrediction?: boolean;
}

/**
 * Stream text generation for artifacts with data stream integration
 */
export async function streamArtifactGeneration(
  config: ArtifactGenerationConfig,
  dataStream: UIMessageStreamWriter,
): Promise<string> {
  const {
    model,
    systemPrompt,
    prompt,
    existingContent,
    chunking = 'word',
    enablePrediction = false,
  } = config;

  let fullContent = '';

  const streamConfig: Parameters<typeof streamText>[0] = {
    model,
    system: systemPrompt,
    experimental_transform: smoothStream({ chunking }),
    prompt,
    experimental_telemetry: { isEnabled: true },
  };

  // Add prediction metadata if enabled and existing content provided
  if (enablePrediction && existingContent) {
    streamConfig.providerOptions = {
      openai: {
        prediction: {
          type: 'content',
          content: existingContent,
        },
      },
    };
  }

  const { fullStream } = streamText(streamConfig);

  for await (const delta of fullStream) {
    const { type } = delta;

    if (type === 'text-delta') {
      const { text: textDelta } = delta;
      fullContent += textDelta;

      dataStream.write({
        type: 'text-delta',
        id: `delta_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        delta: textDelta,
      });
    }
  }

  return fullContent;
}

/**
 * Create artifact generation handler for specific content types
 */
export function createArtifactGenerator(
  defaultSystemPrompt: string,
  updateSystemPromptTemplate?: (content: string, description: string) => string,
) {
  return {
    /**
     * Generate new artifact content
     */
    async create(
      model: LanguageModel,
      title: string,
      dataStream: UIMessageStreamWriter,
      options?: {
        systemPrompt?: string;
        chunking?: 'word' | 'line';
      },
    ): Promise<string> {
      return streamArtifactGeneration(
        {
          model,
          systemPrompt: options?.systemPrompt || defaultSystemPrompt,
          prompt: title,
          chunking: options?.chunking,
        },
        dataStream,
      );
    },

    /**
     * Update existing artifact content
     */
    async update(
      model: LanguageModel,
      existingContent: string,
      description: string,
      dataStream: UIMessageStreamWriter,
      options?: {
        systemPrompt?: string;
        chunking?: 'word' | 'line';
        enablePrediction?: boolean;
      },
    ): Promise<string> {
      const systemPrompt =
        options?.systemPrompt ||
        (updateSystemPromptTemplate
          ? updateSystemPromptTemplate(existingContent, description)
          : `Update the following content based on the description:

${existingContent}`);

      return streamArtifactGeneration(
        {
          model,
          systemPrompt,
          prompt: description,
          existingContent,
          chunking: options?.chunking,
          enablePrediction: options?.enablePrediction,
        },
        dataStream,
      );
    },
  };
}

/**
 * Pre-configured generators for common content types
 */
export const textArtifactGenerator = createArtifactGenerator(
  'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
  (content, description) =>
    `Update the following text content based on the description:

${content}

Description: ${description}`,
);

export const codeArtifactGenerator = createArtifactGenerator(
  'Generate clean, well-commented code based on the requirements. Follow best practices and include appropriate error handling.',
  (content, description) =>
    `Update the following code based on the description:

${content}

Update description: ${description}`,
);

export const documentArtifactGenerator = createArtifactGenerator(
  'Create a well-structured document with clear sections and formatting. Use markdown for better readability.',
  (content, description) =>
    `Update the following document based on the description:

${content}

Update requirements: ${description}`,
);
