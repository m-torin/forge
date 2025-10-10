/**
 * Cross-Provider Composition Examples
 *
 * Demonstrates how Google provider compositions work orthogonally
 * with other provider compositions following the AI SDK v5 pattern.
 */

import {
  withCacheControl,
  withImageGeneration as withOpenAIImageGeneration,
  withImages as withPerplexityImages,
  withReasoning,
  withSafetySettings,
  withStructuredOutput,
  withThinking,
} from '../src/index.ts';

/**
 * Example 1: Google-specific thinking and safety
 * These compositions only apply to Google models and are ignored by other providers
 */
const googleConfig = {
  ...withThinking(12000, true), // Google-specific thinking
  ...withSafetySettings('BLOCK_MEDIUM_AND_ABOVE'), // Google-specific safety
};

/**
 * Example 2: Perplexity-specific image responses
 * Only applies to Perplexity models
 */
const perplexityConfig = {
  ...withPerplexityImages(), // Perplexity-specific return_images
};

/**
 * Example 3: Anthropic-specific reasoning and caching
 * Only applies to Anthropic models
 */
const anthropicConfig = {
  ...withReasoning(), // Anthropic-specific reasoning
  ...withCacheControl(), // Anthropic-specific cache control
};

/**
 * Example 4: OpenAI-specific structured output and image generation
 * Only applies to OpenAI models
 */
const openaiConfig = {
  ...withStructuredOutput(), // OpenAI-specific structured output
  ...withOpenAIImageGeneration(), // OpenAI-specific image generation
};

/**
 * Example 5: Cross-provider composition - each provider only uses its own options
 * This is the power of orthogonal composition - configurations don't interfere
 */
const mixedConfig = {
  // All provider options can coexist
  ...withThinking(8000, false), // Only affects Google models
  ...withPerplexityImages(), // Only affects Perplexity models
  ...withReasoning(), // Only affects Anthropic models
  ...withStructuredOutput(), // Only affects OpenAI models

  // Shared AI SDK v5 options (work with all providers)
  temperature: 0.7,
  maxOutputTokens: 2000,
};

/**
 * Usage examples showing orthogonal behavior:
 */

// Google model uses Google options, ignores others
// generateText({ model: google('gemini-2.5-pro'), prompt: 'Explain AI', ...mixedConfig });
// Result: Uses thinkingConfig, ignores Perplexity/Anthropic/OpenAI options

// Perplexity model uses Perplexity options, ignores others
// generateText({ model: perplexity('sonar-pro'), prompt: 'Latest news', ...mixedConfig });
// Result: Uses return_images, ignores Google/Anthropic/OpenAI options

// Anthropic model uses Anthropic options, ignores others
// generateText({ model: anthropic('claude-3.5-sonnet'), prompt: 'Analyze data', ...mixedConfig });
// Result: Uses reasoning options, ignores Google/Perplexity/OpenAI options

// OpenAI model uses OpenAI options, ignores others
// generateText({ model: openai('gpt-4'), prompt: 'Generate JSON', ...mixedConfig });
// Result: Uses structured output, ignores Google/Perplexity/Anthropic options

/**
 * Gateway compatibility - works with both direct providers and gateways
 */

// Through Vercel AI Gateway
// generateText({ model: gateway('google/gemini-2.5-pro'), ...googleConfig });
// generateText({ model: gateway('perplexity/sonar-pro'), ...perplexityConfig });

// Through Cloudflare AI Gateway
// generateText({ model: cloudflareGateway('Google AI Studio', 'gemini-2.5-pro'), ...googleConfig });
// generateText({ model: cloudflareGateway('Perplexity AI', 'sonar-pro'), ...perplexityConfig });

/**
 * Registry-based usage with enhanced models
 */

// Enhanced Google models from registry
// const result = await generateText({
//   model: models.google('google-thinking'),  // Pre-configured with thinking
//   prompt: 'Complex reasoning task',
//   // Additional Google options still work
//   ...withSafetySettings('BLOCK_ONLY_HIGH')
// });

// Enhanced models combine provider defaults with custom overrides
// models.google('google-multimodal') + withGoogleImageGeneration() + withThinking(16000)

console.log('Cross-provider composition examples loaded successfully!');
console.log('Key benefits:');
console.log("  • Orthogonal: Provider options don't interfere with each other");
console.log('  • Gateway-compatible: Works with both direct providers and gateways');
console.log('  • Registry-integrated: Enhanced models combine with custom configurations');
console.log('  • Type-safe: TypeScript ensures only valid combinations');
