/**
 * AI SDK v5 RAG Example - Exact Implementation from Documentation
 *
 * This example exactly matches the patterns shown in the Vercel AI SDK v5 documentation
 * for building a RAG chatbot with tools.
 */

import { openai } from '@ai-sdk/openai';
import { Index } from '@upstash/vector';
import { embed, embedMany, streamText, tool } from 'ai';
import { z } from 'zod/v4';

// Configuration types matching the documentation
interface RAGConfig {
  vectorUrl: string;
  vectorToken: string;
  namespace?: string;
}

/**
 * Generate chunks - simple sentence splitting like in the documentation
 */
const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

/**
 * Generate embeddings - exactly as shown in documentation
 */
export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-ada-002'),
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

/**
 * Generate single embedding - exactly as shown in documentation
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll(
    '\
',
    ' ',
  );
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-ada-002'),
    value: input,
  });
  return embedding;
};

/**
 * Find relevant content - exactly as shown in documentation
 */
export const findRelevantContent = async (userQuery: string, config: RAGConfig) => {
  const index = new Index({
    url: config.vectorUrl,
    token: config.vectorToken,
  });

  const userQueryEmbedded = await generateEmbedding(userQuery);

  const results = await index.query({
    vector: userQueryEmbedded,
    topK: 4,
    includeMetadata: true,
  });

  return results
    .filter(result => result.score > 0.5)
    .map(result => ({
      name: result.metadata?.content as string,
      similarity: result.score,
    }));
};

/**
 * Create resource function - matches documentation pattern
 */
export const createResource = async (input: { content: string }, config: RAGConfig) => {
  try {
    const index = new Index({
      url: config.vectorUrl,
      token: config.vectorToken,
    });

    const embeddings = await generateEmbeddings(input.content);

    const vectorData = embeddings.map((embedding, i) => ({
      id: `resource_${Date.now()}_${i}`,
      vector: embedding.embedding,
      metadata: {
        content: embedding.content,
        timestamp: new Date().toISOString(),
      },
    }));

    await index.upsert(vectorData);
    return 'Resource successfully created and embedded.';
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};

/**
 * Create RAG chat handler - exactly matching documentation pattern
 */
export function createRAGChatHandler(config: RAGConfig) {
  return async (req: Request) => {
    const { messages } = await req.json();

    const result = streamText({
      model: openai('gpt-4o'),
      system: `You are a helpful assistant. Check your knowledge base before answering any questions.
        Only respond to questions using information from tool calls.
        if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
      messages,
      tools: {
        addResource: tool({
          description: `add a resource to your knowledge base.
            If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
          inputSchema: z.object({
            content: z.string().describe('the content or resource to add to the knowledge base'),
          }),
          execute: async ({ content }) => createResource({ content }, config),
        }),
        getInformation: tool({
          description: `get information from your knowledge base to answer questions.`,
          inputSchema: z.object({
            question: z.string().describe('the users question'),
          }),
          execute: async ({ question }) => findRelevantContent(question, config),
        }),
      },
      maxSteps: 3,
    });

    return result.toTextStreamResponse();
  };
}

/**
 * Example usage exactly matching the documentation
 */
export async function runDocumentationExample() {
  // This would be set from environment variables
  const config: RAGConfig = {
    vectorUrl: process.env.UPSTASH_VECTOR_REST_URL as string,
    vectorToken: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
  };

  // Add some sample content
  await createResource(
    {
      content:
        "Paris is the capital of France. It's known for the Eiffel Tower and amazing cuisine.",
    },
    config,
  );

  // Query the knowledge base
  const results = await findRelevantContent('What is Paris known for?', config);
  console.log('Search results:', results);

  return results;
}

// Export for use in other files
export { RAGConfig };
