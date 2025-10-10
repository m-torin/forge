/**
 * Provider factory functions
 */

import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { deepinfra } from '@ai-sdk/deepinfra';
import { google } from '@ai-sdk/google';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { createPerplexity, perplexity } from '@ai-sdk/perplexity';

// Anthropic exports
export { extractCacheMetadata } from './anthropic';
export const anthropicExamples = {
  basic: 'Generate a simple response',
  reasoningText: 'Think step by step about this problem',
  withCache: 'Use cache control for this conversation',
};

export function createAnthropicModel(modelId: string = 'claude-3-5-sonnet-20241022') {
  return anthropic(modelId);
}

export function createAnthropicProvider(config?: Parameters<typeof createAnthropic>[0]) {
  return createAnthropic(config);
}

// Tool creation helpers
export function createBashTool(): ReturnType<typeof anthropic.tools.bash_20241022> {
  return anthropic.tools.bash_20241022?.({}) || { name: 'bash', description: 'Bash tool' };
}

export function createComputerTool(): ReturnType<typeof anthropic.tools.computer_20241022> {
  return (
    anthropic.tools.computer_20241022?.({
      displayWidthPx: 1920,
      displayHeightPx: 1080,
    }) || { name: 'computer', description: 'Computer use tool' }
  );
}

// Other provider model creation
export function createOpenAIModel(modelId: string = 'gpt-4o') {
  return openai(modelId);
}

export function createGoogleModel(modelId: string = 'gemini-2.0-flash') {
  return google(modelId);
}

export function createPerplexityModel(modelId: string = 'sonar') {
  return perplexity(modelId);
}

export function createDeepInfraModel(modelId: string = 'meta-llama/Llama-3.3-70B-Instruct-Turbo') {
  return deepinfra(modelId);
}

// Web search models
export function createWebSearchGoogleModel() {
  return google('gemini-2.0-flash');
}

export function createWebSearchPerplexityModel() {
  return perplexity('sonar-reasoning');
}

// Web search functions
export async function webSearchWithGemini(query: string) {
  const model = createWebSearchGoogleModel();
  const { generateText } = await import('ai');
  const { text } = await generateText({
    model,
    prompt: `Search for: ${query}`,
  });
  return text;
}

export async function webSearchWithPerplexity(query: string) {
  const model = createWebSearchPerplexityModel();
  const { generateText } = await import('ai');
  const { text } = await generateText({
    model,
    prompt: query,
  });
  return text;
}

// Type exports - properly typed from the packages
export type AnthropicProviderConfig = Parameters<typeof createAnthropic>[0];
export type OpenAIProviderConfig = Parameters<typeof createOpenAI>[0];
export type PerplexityProviderConfig = Parameters<typeof createPerplexity>[0];
