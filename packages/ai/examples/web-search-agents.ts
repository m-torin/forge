/**
 * Web Search Agent Examples
 * Demonstrates web search capabilities using pure AI SDK patterns
 * Following the official Vercel AI SDK documentation
 */

import {
  createWebSearchGoogleModel,
  createWebSearchPerplexityModel,
  enhancedGenerateText,
  webSearchWithGemini,
  webSearchWithPerplexity,
} from '../src/server-next';

/**
 * Example 1: Perplexity Web Search (Native Web Search)
 * Sonar models have built-in web search capabilities
 */
export async function perplexityWebSearchExample() {
  console.log('🔍 Perplexity Web Search Example');

  // Method 1: Using the helper function
  const result1 = await webSearchWithPerplexity(
    'What are the latest developments in quantum computing?',
    {
      model: 'sonar-pro',
      return_images: false, // Tier 2 feature
    },
  );

  console.log('📝 Response:', result1.text);
  console.log('📚 Sources:', result1.sources);

  // Method 2: Using the model factory directly (AI SDK pattern)
  const model = createWebSearchPerplexityModel('sonar-pro');

  const result2 = await enhancedGenerateText({
    model,
    prompt: 'What happened in San Francisco last week?',
    maxTokens: 1000,
    // Provider options are passed here (AI SDK pattern)
    providerOptions: {
      perplexity: {
        return_images: true, // Enable images for Tier 2 users
      },
    },
  });

  console.log('📝 Response with images:', result2.text);
  console.log('📚 Sources:', result2.sources);
  console.log('🖼️ Provider Metadata:', result2.providerMetadata);
}

/**
 * Example 2: Google Gemini Web Search (Search Grounding)
 * Uses Google Search to ground responses in current information
 */
export async function geminiWebSearchExample() {
  console.log('🔍 Google Gemini Web Search Example');

  // Method 1: Using the helper function
  const result1 = await webSearchWithGemini(
    'List the top 5 San Francisco news from the past week. You must include the date of each article.',
    {
      model: 'gemini-1.5-pro',
      useSearchGrounding: true,
    },
  );

  console.log('📝 Response:', result1.text);
  console.log('📚 Sources:', result1.sources);
  console.log('🛡️ Provider Metadata:', result1.providerMetadata);

  // Method 2: Using the model factory directly (AI SDK pattern)
  const model = createWebSearchGoogleModel('gemini-1.5-pro', {
    useSearchGrounding: true,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  });

  const result2 = await enhancedGenerateText({
    model,
    prompt: 'What are the current trends in artificial intelligence?',
    maxTokens: 1500,
  });

  console.log('📝 Response:', result2.text);
  console.log('📚 Sources:', result2.sources);

  // Access grounding metadata (following AI SDK documentation)
  const metadata = result2.providerMetadata?.google;
  const groundingMetadata = metadata?.groundingMetadata;
  const safetyRatings = metadata?.safetyRatings;

  console.log('🔍 Grounding Metadata:', groundingMetadata);
  console.log('🛡️ Safety Ratings:', safetyRatings);
}

/**
 * Example 3: Comparing Web Search Providers
 * Shows how to use both providers for the same query
 */
export async function compareWebSearchProviders() {
  console.log('⚖️ Comparing Web Search Providers');

  const query = 'What are the latest breakthroughs in renewable energy?';

  // Perplexity (Native Web Search)
  const perplexityResult = await webSearchWithPerplexity(query, {
    model: 'sonar-pro',
  });

  // Google Gemini (Search Grounding)
  const geminiResult = await webSearchWithGemini(query, {
    model: 'gemini-1.5-pro',
    useSearchGrounding: true,
  });

  console.log('🟣 Perplexity Response:');
  console.log('  Text:', perplexityResult.text.substring(0, 200) + '...');
  console.log('  Sources:', perplexityResult.sources?.length || 0);

  console.log('🔵 Gemini Response:');
  console.log('  Text:', geminiResult.text.substring(0, 200) + '...');
  console.log('  Sources:', geminiResult.sources?.length || 0);
}

/**
 * Example 4: Streaming Web Search (AI SDK Pattern)
 * Shows how to stream web search results
 */
export async function streamingWebSearchExample() {
  console.log('🌊 Streaming Web Search Example');

  const { streamText } = await import('ai');

  // Perplexity streaming (sources included automatically)
  const perplexityModel = createWebSearchPerplexityModel('sonar-pro');

  const perplexityStream = await streamText({
    model: perplexityModel,
    prompt: 'What are the top tech news stories today?',
  });

  console.log('🟣 Perplexity Stream:');
  for await (const chunk of perplexityStream.textStream) {
    process.stdout.write(chunk);
  }

  // Access final result after streaming
  const perplexityResult = await perplexityStream;
  console.log('\n📚 Final Sources:', perplexityResult.sources);

  // Google Gemini streaming with search grounding
  const geminiModel = createWebSearchGoogleModel('gemini-1.5-pro', {
    useSearchGrounding: true,
  });

  const geminiStream = await streamText({
    model: geminiModel,
    prompt: 'What are the latest developments in space exploration?',
  });

  console.log('\n🔵 Gemini Stream:');
  for await (const chunk of geminiStream.textStream) {
    process.stdout.write(chunk);
  }

  // Access final result and metadata after streaming
  const geminiResult = await geminiStream;
  console.log('\n📚 Final Sources:', geminiResult.sources);
  console.log('��️ Provider Metadata:', geminiResult.providerMetadata);
}

/**
 * Run all examples
 */
export async function runAllWebSearchExamples() {
  try {
    await perplexityWebSearchExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await geminiWebSearchExample();
    console.log('\n' + '='.repeat(50) + '\n');

    await compareWebSearchProviders();
    console.log('\n' + '='.repeat(50) + '\n');

    await streamingWebSearchExample();
  } catch (error) {
    console.error('❌ Error running web search examples:', error);
  }
}

// Export examples for testing
export const examples = {
  perplexity: perplexityWebSearchExample,
  gemini: geminiWebSearchExample,
  compare: compareWebSearchProviders,
  streaming: streamingWebSearchExample,
  all: runAllWebSearchExamples,
};
