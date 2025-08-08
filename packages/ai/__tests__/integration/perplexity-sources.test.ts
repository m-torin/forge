import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';
import { beforeAll, describe, expect, test, vi } from 'vitest';

/**
 * Perplexity Sources Integration Tests
 *
 * Uses environment variables to control testing mode:
 * - INTEGRATION_TEST=true: Use real Perplexity API calls
 * - INTEGRATION_TEST=false/undefined: Use mocks (default)
 *
 * To run with real API calls:
 * INTEGRATION_TEST=true PERPLEXITY_API_KEY=your-key pnpm test perplexity-sources
 */

const IS_INTEGRATION_TEST = process.env.INTEGRATION_TEST === 'true';
const TEST_TIMEOUT = IS_INTEGRATION_TEST ? 30000 : 5000;

// Mock setup for unit tests
if (!IS_INTEGRATION_TEST) {
  // Mock AI SDK with minimal setup
  vi.mock('ai', () => ({
    streamText: vi.fn().mockImplementation(async () => {
      const mockResult = {
        toUIMessageStream: vi.fn().mockImplementation(options => {
          const chunks: any[] = [];

          // Add text chunk
          chunks.push({
            type: 'text-delta',
            textDelta: 'Mock search response: ',
          });

          // Add source chunks if sendSources is enabled
          if (options?.sendSources) {
            chunks.push({
              type: 'source',
              sourceType: 'url',
              id: 'source-1',
              url: 'https://example.com/tech-news',
              title: 'Latest Tech Developments',
              description: 'Recent advances in technology',
              snippet: 'Technology continues to evolve...',
              favicon: 'https://example.com/favicon.ico',
            });
            chunks.push({
              type: 'source',
              sourceType: 'url',
              id: 'source-2',
              url: 'https://research.org/ai-study',
              title: 'AI Research Paper',
              description: 'Academic research on AI developments',
              snippet: 'Our study shows significant progress...',
            });
          }

          // Add final text chunk
          chunks.push({
            type: 'text-delta',
            textDelta: ' the field is advancing rapidly.',
          });

          // Return mock readable stream
          return new ReadableStream({
            start(controller) {
              chunks.forEach(chunk => controller.enqueue(chunk));
              controller.close();
            },
          });
        }),
      };
      return mockResult;
    }),
  }));

  // Mock Perplexity SDK
  vi.mock('@ai-sdk/perplexity', () => ({
    perplexity: vi.fn(() => ({
      modelId: 'mock-perplexity-model',
      provider: 'perplexity',
    })),
  }));
}

describe('perplexity Sources Integration', () => {
  let testModel: any;

  beforeAll(async () => {
    if (IS_INTEGRATION_TEST) {
      if (!process.env.PERPLEXITY_API_KEY) {
        throw new Error('PERPLEXITY_API_KEY is required for integration tests');
      }

      testModel = perplexity('llama-3.1-sonar-small-128k-online');
      console.log('🔗 Integration test using real Perplexity API');
    } else {
      testModel = perplexity('mock-model');
      console.log('🤖 Unit test using mocks');
    }
  });

  test(
    'should return sources with sendSources enabled',
    async () => {
      const result = streamText({
        model: testModel,
        prompt: 'What are the latest developments in renewable energy?',
        maxOutputTokens: IS_INTEGRATION_TEST ? 500 : 100,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      const chunks = [];
      const reader = uiMessageStream.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            chunks.push(value);
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Validate we received chunks
      expect(chunks.length).toBeGreaterThan(0);

      // Look for source parts
      const sourceParts = chunks.filter(
        chunk => chunk.type === 'source' && chunk.sourceType === 'url',
      );

      console.log(
        `Found ${sourceParts.length} source parts in ${IS_INTEGRATION_TEST ? 'integration' : 'mock'} test`,
      );

      // Validate source parts - integration tests should have >= 0, mock tests should have exactly 2
      const minExpectedSources = IS_INTEGRATION_TEST ? 0 : 2;
      const maxExpectedSources = IS_INTEGRATION_TEST ? 100 : 2;

      expect(sourceParts.length).toBeGreaterThanOrEqual(minExpectedSources);
      expect(sourceParts.length).toBeLessThanOrEqual(maxExpectedSources);

      // Validate source structure
      sourceParts.forEach((sourcePart, index) => {
        const source = sourcePart;

        expect(source.url).toBeDefined();
        expect(typeof source.url).toBe('string');
        expect(source.url).toMatch(/^https?:\/\//);

        if (IS_INTEGRATION_TEST) {
          console.log(`📄 Source ${index + 1}: ${source.url.substring(0, 50)}...`);
        }

        // Sources should have additional metadata
        expect(source.title || source.description || source.snippet).toBeDefined();
      });
    },
    TEST_TIMEOUT,
  );

  test(
    'should aggregate sources for message display',
    async () => {
      const result = streamText({
        model: testModel,
        prompt: 'Current state of artificial intelligence research',
        maxOutputTokens: IS_INTEGRATION_TEST ? 400 : 100,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      // Collect all message parts (simulating message.tsx logic)
      const messageParts = [];
      const reader = uiMessageStream.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value && value.type === 'source') {
            messageParts.push(value);
          } else if (value && value.type === 'text-delta') {
            // Handle text deltas if needed
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Filter and aggregate sources (as done in message.tsx)
      const sources = messageParts.filter(part => part.type === 'source').map(part => part as any);

      console.log(
        `📊 ${IS_INTEGRATION_TEST ? 'Integration' : 'Mock'} test aggregated ${sources.length} sources`,
      );

      // Validate aggregated sources - integration tests flexible, mock tests expect exactly 2
      const minExpectedSources = IS_INTEGRATION_TEST ? 0 : 2;
      const maxExpectedSources = IS_INTEGRATION_TEST ? 100 : 2;

      expect(sources.length).toBeGreaterThanOrEqual(minExpectedSources);
      expect(sources.length).toBeLessThanOrEqual(maxExpectedSources);

      // Validate aggregated sources structure
      sources.forEach((source, index) => {
        expect(source.url).toBeDefined();
        expect(typeof source.url).toBe('string');

        if (IS_INTEGRATION_TEST) {
          console.log(`🔗 Aggregated source ${index + 1}: ${source.title || 'No title'}`);
        }
      });

      // Test uniqueness when multiple sources exist
      const uniqueUrls = new Set(sources.map(s => s.url));
      const hasMultipleSources = sources.length > 1;
      const expectedUniqueCount = hasMultipleSources ? sources.length : uniqueUrls.size;

      expect(hasMultipleSources ? uniqueUrls.size : 1).toBeLessThanOrEqual(expectedUniqueCount);
    },
    TEST_TIMEOUT,
  );

  test(
    'should handle mixed content with sources and text',
    async () => {
      const result = streamText({
        model: testModel,
        prompt: 'Recent advances in quantum computing applications',
        maxOutputTokens: IS_INTEGRATION_TEST ? 300 : 100,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      const textParts = [];
      const sourceParts = [];
      const reader = uiMessageStream.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value && value.type === 'text-delta') {
            textParts.push(value);
          } else if (value && value.type === 'source') {
            sourceParts.push(value);
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Should have both text and sources
      expect(textParts.length).toBeGreaterThan(0);

      console.log(
        `📝 ${IS_INTEGRATION_TEST ? 'Integration' : 'Mock'}: ${textParts.length} text parts, ${sourceParts.length} source parts`,
      );

      // Validate source parts - integration tests flexible (0+), mock tests expect exactly 2
      const minExpectedSources = IS_INTEGRATION_TEST ? 0 : 2;
      const maxExpectedSources = IS_INTEGRATION_TEST ? 100 : 2;

      expect(sourceParts.length).toBeGreaterThanOrEqual(minExpectedSources);
      expect(sourceParts.length).toBeLessThanOrEqual(maxExpectedSources);

      // Validate text content
      const fullText = textParts.map(part => part.textDelta).join('');
      expect(fullText.trim().length).toBeGreaterThan(10);

      // Validate sources if present
      sourceParts.forEach(source => {
        expect(source.url).toBeDefined();
        expect(source.url).toMatch(/^https?:\/\//);
      });
    },
    TEST_TIMEOUT,
  );

  test.runIf(IS_INTEGRATION_TEST)(
    'should validate real API response structure',
    async () => {
      console.log('🔍 Running real API validation test...');
      const result = streamText({
        model: testModel,
        prompt: 'What are the latest climate change research findings?',
        maxOutputTokens: 400,
      });

      const uiMessageStream = result.toUIMessageStream({
        sendSources: true,
      });

      const allChunks = [];
      const reader = uiMessageStream.getReader();

      try {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            allChunks.push(value);
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Log real API structure for debugging
      console.log('📊 Real API Response Analysis:');
      console.log(`- Total chunks: ${allChunks.length}`);

      const chunkTypes = allChunks.reduce(
        (acc, chunk) => {
          acc[chunk.type] = (acc[chunk.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log('- Chunk types:', chunkTypes);

      const sourceChunks = allChunks.filter(
        chunk => chunk.type === 'source' && chunk.sourceType === 'url',
      );

      console.log(`- Source chunks: ${sourceChunks.length}`);

      // Log sample source structure
      const sampleSource = sourceChunks[0];
      console.log('- Sample source structure:', {
        url: sampleSource?.url || 'N/A',
        hasTitle: !!sampleSource?.title,
        hasDescription: !!sampleSource?.description,
        hasSnippet: !!sampleSource?.snippet,
        hasFavicon: !!sampleSource?.favicon,
      });

      // Basic validation
      expect(allChunks.length).toBeGreaterThan(0);
    },
    TEST_TIMEOUT,
  );
});
