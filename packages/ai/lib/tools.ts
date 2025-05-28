import { tool } from 'ai';
import { z } from 'zod';

// Example tools that can be used in AI applications
export const tools = {
  // Calculator tool
  calculate: tool({
    description: 'Perform mathematical calculations',
    execute: async ({ expression }) => {
      try {
        // In production, use a safe math parser
        // eslint-disable-next-line security/detect-eval-with-expression
        const result = eval(expression);
        return { result };
      } catch {
        return { error: 'Invalid mathematical expression' };
      }
    },
    parameters: z.object({
      expression: z.string().describe('Mathematical expression to evaluate'),
    }),
  }),

  // Web search tool
  search: tool({
    description: 'Search the web for information',
    execute: async ({ _limit, query }) => {
      // This would integrate with a search API
      return {
        results: [
          {
            url: 'https://example.com',
            snippet: 'This would be replaced with actual search implementation',
            title: `Search result for: ${query}`,
          },
        ],
      };
    },
    parameters: z.object({
      _limit: z.number().optional().default(5).describe('Number of results to return'),
      query: z.string().describe('Search query'),
    }),
  }),

  // Date/time tool
  getDateTime: tool({
    description: 'Get current date and time information',
    execute: async ({ format, timezone }) => {
      const date = new Date();

      switch (format) {
        case 'iso':
          return { datetime: date.toISOString() };
        case 'unix':
          return { datetime: date.getTime() };
        case 'human':
        default:
          return {
            datetime: date.toLocaleString('en-US', {
              dateStyle: 'full',
              timeStyle: 'long',
              timeZone: timezone || 'UTC',
            }),
          };
      }
    },
    parameters: z.object({
      format: z.enum(['iso', 'human', 'unix']).optional().default('human'),
      timezone: z.string().optional().describe('Timezone (e.g., "America/New_York")'),
    }),
  }),

  // JSON formatter tool
  formatJson: tool({
    description: 'Format or parse JSON data',
    execute: async ({ data, indent, operation }) => {
      try {
        if (operation === 'parse') {
          return { result: JSON.parse(data) };
        } else {
          const obj = JSON.parse(data);
          return { result: JSON.stringify(obj, null, indent) };
        }
      } catch {
        return { error: 'Failed to execute code' };
      }
    },
    parameters: z.object({
      data: z.string().describe('JSON string to format or stringify'),
      indent: z.number().optional().default(2).describe('Indentation for stringify'),
      operation: z.enum(['parse', 'stringify']).describe('Operation to perform'),
    }),
  }),
};

// Tool collection type for easy usage
export type AITools = typeof tools;

// Helper to get all tools as array
export const getAllTools = () => Object.values(tools);

// Helper to get specific tools
export const getTools = (...toolNames: (keyof AITools)[]) => toolNames.map((name) => tools[name]);
