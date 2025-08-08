import { tool } from 'ai';
import Exa from 'exa-js';
import { z } from 'zod/v4';

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
}

export interface ExaSearchConfig {
  apiKey: string;
  numResults?: number;
  livecrawl?: 'always' | 'fallback' | 'never';
}

/**
 * Create a web search tool using Exa API
 * Exa is a search API designed for AI applications
 */
export function createExaSearchTool(config: ExaSearchConfig) {
  const exa = new Exa(config.apiKey);

  return tool({
    description: 'Search the web for up-to-date information using Exa',
    inputSchema: z.object({
      query: z.string().min(1).max(100).describe('The search query'),
    }),
    execute: async ({ query }: { query: string }) => {
      const { results } = await exa.searchAndContents(query, {
        livecrawl: config.livecrawl ?? 'always',
        numResults: config.numResults ?? 3,
      });

      return results.map(result => ({
        title: result.title,
        url: result.url,
        content: result.text.slice(0, 1000), // First 1000 characters
        publishedDate: result.publishedDate,
      })) as WebSearchResult[];
    },
  });
}

/**
 * Create a generic web search tool that can be customized
 */
export function createWebSearchTool(searchFunction: (query: string) => Promise<WebSearchResult[]>) {
  return tool({
    description: 'Search the web for up-to-date information',
    inputSchema: z.object({
      query: z.string().min(1).max(100).describe('The search query'),
    }),
    execute: async ({ query }: { query: string }) => {
      return searchFunction(query);
    },
  });
}

/**
 * Pre-configured search tools for common APIs
 */
export const webSearchTools = {
  /**
   * Exa search tool
   */
  exa: (apiKey: string, options?: Partial<ExaSearchConfig>) =>
    createExaSearchTool({ apiKey, ...options }),

  /**
   * Custom search implementation
   */
  custom: (searchFunction: (query: string) => Promise<WebSearchResult[]>) =>
    createWebSearchTool(searchFunction),
};
