/**
 * Google Generative AI Provider - Complete Examples
 *
 * Demonstrates all Google provider capabilities with real-world usage patterns.
 * Positioned as "Balanced Plus" in the provider spectrum: more features than xAI,
 * comprehensive thinking + multimodal + safety approach.
 */

import {
  // Constants and presets
  GOOGLE_MODEL_IDS,
  isGemmaModel,
  supportsGoogleCodeExecution,
  supportsGoogleSearch,
  supportsMultimodal,
  // Capability detection (8 functions)
  supportsThinking,
} from '../src/index';

// Uncomment imports below for actual usage:
// import { generateText, streamText, generateObject } from 'ai';

/**
 * EXAMPLE 1: Basic Text Generation with Thinking
 * Google's unique thinking capability for complex reasoning
 */
export async function basicThinkingExample() {
  /*
  const result = await generateText({
    model: google('gemini-2.5-pro'),
    prompt: 'Explain quantum computing principles and their practical applications',
    ...withThinking(12000, true) // 12K token thinking budget, include thoughts
  });
  
  console.log('Response:', result.text);
  
  // Extract thinking details
  const thinking = extractThinkingDetails(result);
  if (thinking) {
    console.log('Thinking tokens used:', thinking.actualThinkingTokens);
    console.log('Thinking summary:', thinking.thinkingSummary);
  }
  */
}

/**
 * EXAMPLE 2: Safety-First Content Generation
 * Comprehensive safety controls with granular harm category settings
 */
export async function safetyFirstExample() {
  /*
  const result = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: 'Discuss social media impact on teenagers',
    ...withSafetySettings('BLOCK_MEDIUM_AND_ABOVE', {
      HARASSMENT: 'BLOCK_NONE',        // Allow discussion of harassment topics
      HATE_SPEECH: 'BLOCK_ONLY_HIGH',  // Stricter hate speech filtering
      DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE' // Standard dangerous content blocking
    })
  });
  
  // Check safety ratings
  const safetyRatings = extractSafetyRatings(result);
  console.log('Safety assessment:', safetyRatings);
  
  const blocked = safetyRatings.filter(rating => rating.blocked);
  if (blocked.length > 0) {
    console.log('Content blocked for:', blocked.map(r => r.category));
  }
  */
}

/**
 * EXAMPLE 3: Advanced Multimodal Processing
 * Superior multimodal capabilities: PDFs, videos, images, YouTube
 */
export async function multimodalExample() {
  /*
  const result = await generateText({
    model: google('gemini-1.5-pro'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze these documents and images for insights' },
          { type: 'image', image: 'path/to/chart.png' },
          { type: 'file', file: 'path/to/report.pdf' }
        ]
      }
    ],
    ...withFileInputs(['gs://bucket/document.pdf', 'gs://bucket/video.mp4'], 'HIGH'),
    ...withYouTubeContext('https://youtube.com/watch?v=dQw4w9WgXcQ', 
                         ['TRANSCRIPT', 'COMMENTS', 'METADATA'])
  });
  
  console.log('Multimodal analysis:', result.text);
  */
}

/**
 * EXAMPLE 4: Structured Data Generation
 * Complex structured outputs with schema validation
 */
export async function structuredOutputExample() {
  /*
  const userSchema = {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            skills: { 
              type: 'array', 
              items: { type: 'string' }
            },
            experience: {
              type: 'object',
              properties: {
                years: { type: 'number' },
                companies: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    }
  };

  const result = await generateObject({
    model: google('gemini-2.5-pro'),
    prompt: 'Generate 5 sample user profiles for a tech company',
    schema: userSchema,
    ...withStructuredOutputs(userSchema, 'STRICT')
  });
  
  console.log('Generated users:', result.object.users);
  */
}

/**
 * EXAMPLE 5: Native Tool Integration
 * Using Google's built-in tools for search, URL context, and code execution
 */
export async function nativeToolsExample() {
  /*
  const result = await generateText({
    model: google('gemini-2.5-pro'),
    prompt: 'Research the latest AI developments and write Python code to analyze the data',
    tools: {
      // Google native tools (re-exported from AI SDK v5)
      search: googleTools.googleSearch,
      urlContext: googleTools.urlContext, 
      codeExecution: googleTools.codeExecution
    },
    toolChoice: 'auto',
    maxToolRoundtrips: 5
  });
  
  console.log('Research and analysis:', result.text);
  console.log('Tool calls made:', result.toolCalls?.length || 0);
  */
}

/**
 * EXAMPLE 6: Performance-Optimized with Caching
 * Using cached content and implicit caching for better performance
 */
export async function cachedContentExample() {
  /*
  const result = await generateText({
    model: google('gemini-1.5-pro'),
    prompt: 'Analyze this large document for key insights',
    ...withCachedContent('doc-analysis-cache-key', 7200), // 2 hour TTL
    ...withThinking(8000, false), // Thinking without including thoughts
    maxOutputTokens: 1000
  });
  
  const metadata = extractGoogleMetadata(result);
  if (metadata?.caching?.hit) {
    console.log('Cache hit! Response served from cache');
    console.log('TTL remaining:', metadata.caching.ttlRemaining);
  } else {
    console.log('Cache miss - fresh response generated');
  }
  */
}

/**
 * EXAMPLE 7: Image Generation and Processing
 * Google's unique image generation capabilities
 */
export async function imageGenerationExample() {
  /*
  const result = await generateText({
    model: google('gemini-2.5-pro'),
    prompt: 'Generate architectural diagrams for a modern web application',
    ...withGoogleImageGeneration('HIGH', 4, 1024), // High quality, 4 images, 1024px
    ...withResponseModalities(['TEXT', 'IMAGE'])
  });
  
  console.log('Description:', result.text);
  
  const metadata = extractGoogleMetadata(result);
  if (metadata?.imageGeneration?.images) {
    console.log('Generated images:', metadata.imageGeneration.images.length);
  }
  */
}

/**
 * EXAMPLE 8: Gateway Integration
 * Works seamlessly with both Vercel AI Gateway and Cloudflare AI Gateway
 */
export async function gatewayIntegrationExample() {
  /*
  // Through Vercel AI Gateway
  const vercelResult = await generateText({
    model: gateway('google/gemini-2.5-pro'), // Gateway routing
    prompt: 'Explain machine learning concepts',
    ...withThinking(10000, true),            // Google-specific options still work!
    ...withSafetySettings('BLOCK_MEDIUM_AND_ABOVE')
  });
  
  // Through Cloudflare AI Gateway (Google AI Studio supported)
  const cloudflareResult = await generateText({
    model: cloudflareGateway('Google AI Studio', 'gemini-2.5-pro'),
    prompt: 'Analyze market trends',
    ...withGoogleImageGeneration('MEDIUM', 2),
    ...withCachedContent('market-analysis-cache', 3600)
  });
  
  console.log('Gateway responses work with all Google features!');
  */
}

/**
 * EXAMPLE 9: Registry-Enhanced Models
 * Using pre-configured enhanced models from the registry
 */
export async function registryEnhancedExample() {
  /*
  // Enhanced models with pre-configured Google features
  const thinkingResult = await generateText({
    model: models.google('google-thinking'), // Pre-configured with thinking enabled
    prompt: 'Solve this complex logic puzzle step by step',
    // Can still add additional Google options
    ...withSafetySettings('PERMISSIVE')
  });
  
  const multimodalResult = await generateText({
    model: models.google('google-multimodal'), // Pre-configured for multimodal
    messages: [
      {
        role: 'user', 
        content: [
          { type: 'text', text: 'Describe this image' },
          { type: 'image', image: 'path/to/image.jpg' }
        ]
      }
    ]
  });
  
  console.log('Enhanced models combine registry defaults with custom options!');
  */
}

/**
 * EXAMPLE 10: Cross-Provider Composition
 * Google options compose cleanly with other provider options
 */
export async function crossProviderCompositionExample() {
  /*
  const mixedConfig = {
    // Google-specific options
    ...withThinking(12000, true),
    ...withSafetySettings('BLOCK_MEDIUM_AND_ABOVE'),
    
    // Anthropic-specific options (orthogonal - won't interfere)
    ...withReasoning(),
    ...withCacheControl(),
    
    // Perplexity-specific options (orthogonal - won't interfere)
    ...withPerplexityImages(),
    
    // Shared AI SDK v5 options (work with all providers)
    temperature: 0.7,
    maxOutputTokens: 2000
  };
  
  // Google model uses only Google options
  const googleResult = await generateText({
    model: google('gemini-2.5-pro'),
    prompt: 'Google analysis with thinking',
    ...mixedConfig
  });
  // Result: Uses thinkingConfig and safetySettings, ignores others
  
  // Anthropic model uses only Anthropic options
  const anthropicResult = await generateText({
    model: anthropic('claude-3.5-sonnet'),
    prompt: 'Anthropic analysis with reasoning',
    ...mixedConfig
  });
  // Result: Uses reasoning and cacheControl, ignores others
  
  console.log('Orthogonal composition - no interference between providers!');
  */
}

/**
 * EXAMPLE 11: Capability Detection and Model Selection
 * Smart model selection based on capabilities
 */
export function capabilityDetectionExample() {
  // Check model capabilities before using
  const modelId = GOOGLE_MODEL_IDS.GEMINI_2_5_PRO;

  console.log(`Model: ${modelId}`);
  console.log(`Supports thinking: ${supportsThinking(modelId)}`);
  console.log(`Supports Google Search: ${supportsGoogleSearch(modelId)}`);
  console.log(`Supports multimodal: ${supportsMultimodal(modelId)}`);
  console.log(`Supports code execution: ${supportsGoogleCodeExecution(modelId)}`);
  console.log(`Is Gemma model: ${isGemmaModel(modelId)}`);

  // Select model based on requirements
  function selectModelForTask(needsThinking: boolean, needsMultimodal: boolean) {
    const candidates = Object.values(GOOGLE_MODEL_IDS);

    return candidates.find(model => {
      const hasThinking = needsThinking ? supportsThinking(model) : true;
      const hasMultimodal = needsMultimodal ? supportsMultimodal(model) : true;
      return hasThinking && hasMultimodal;
    });
  }

  const thinkingModel = selectModelForTask(true, false);
  const multimodalModel = selectModelForTask(false, true);
  const fullFeaturedModel = selectModelForTask(true, true);

  console.log('Recommended models:');
  console.log(`  Thinking tasks: ${thinkingModel}`);
  console.log(`  Multimodal tasks: ${multimodalModel}`);
  console.log(`  Full-featured tasks: ${fullFeaturedModel}`);
}

/**
 * EXAMPLE 12: Streaming with Google Features
 * Streaming responses with Google-specific features
 */
export async function streamingWithGoogleFeaturesExample() {
  /*
  const stream = await streamText({
    model: google('gemini-2.5-flash'),
    prompt: 'Write a comprehensive guide to sustainable architecture',
    ...withThinking(8000, false), // Thinking without including thoughts in stream
    ...withSafetySettings('BLOCK_ONLY_HIGH'),
    maxOutputTokens: 2000
  });
  
  console.log('Streaming Google response with thinking...');
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk);
  }
  
  // After streaming completes, extract metadata
  const finalResult = await stream.result;
  const thinking = extractThinkingDetails(finalResult);
  
  console.log('\n\nThinking summary:', thinking?.thinkingSummary);
  console.log('Thinking tokens used:', thinking?.actualThinkingTokens);
  */
}

/**
 * USAGE PATTERNS SUMMARY
 */
export function usagePatternsSummary() {
  console.log(`
📚 GOOGLE PROVIDER USAGE PATTERNS SUMMARY

🎯 Positioning: "Balanced Plus" - Enhanced balance with comprehensive features
   • More features than xAI, fewer than Anthropic
   • Safety-first approach with granular controls
   • Superior multimodal excellence

🧠 Core Capabilities:
   • Thinking: withThinking(budgetTokens, includeThoughts)
   • Safety: withSafetySettings(preset, overrides) 
   • Multimodal: withFileInputs(), withGoogleImageGeneration(), withYouTubeContext()
   • Tools: googleTools.{googleSearch, urlContext, codeExecution}

🔧 Composition Patterns:
   • Orthogonal: Google options don't interfere with other providers
   • Gateway-compatible: Works with both Vercel and Cloudflare gateways
   • Registry-enhanced: Pre-configured models with sensible defaults

🚀 Performance Features:
   • Implicit caching: supportsImplicitCaching()
   • Cached content: withCachedContent(key, ttl)
   • Response modalities: withResponseModalities(['TEXT', 'AUDIO'])

📊 Quality Assurance:
   • Comprehensive test coverage (100+ tests)
   • Edge case handling (safety blocking, schema validation)
   • Performance validation (memory, speed, scaling)

🎨 Examples Available:
   • Basic thinking and reasoning
   • Safety-first content generation  
   • Advanced multimodal processing
   • Structured data generation
   • Native tool integration
   • Performance-optimized caching
   • Cross-provider composition
   • Gateway integration
   • Registry-enhanced models
   • Streaming with Google features

🏗️ Architecture Benefits:
   • Provider spectrum positioned correctly (Anthropic ← Google ← xAI)
   • DRY principle compliance
   • AI SDK v5 native integration
   • Type-safe composition helpers
   • Comprehensive capability detection
  `);
}

// Run examples (commented out to avoid actual API calls)
if (require.main === module) {
  console.log('Google Provider Examples');
  console.log('========================');

  capabilityDetectionExample();
  usagePatternsSummary();

  console.log('\n✅ All Google provider examples ready to use!');
  console.log('Uncomment the API calls in each example function to run them.');
}
