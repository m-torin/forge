/**
 * MCP Tool: Safe Stringify
 * Provides safe JSON stringification with circular reference handling
 */

import { safeStringifyPure } from '@repo/core-utils/shared/stringify';

export interface SafeStringifyArgs {
  obj: any;
  maxLength?: number;
  prettify?: boolean;
  includeMetadata?: boolean;
}

export interface MCPToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  metadata?: any;
  isError?: boolean;
}

export const safeStringifyTool = {
  name: 'safe_stringify',
  description:
    'Safely stringify objects with circular reference handling, size limits, and formatting options',
  inputSchema: {
    type: 'object',
    properties: {
      obj: {
        type: 'object',
        description: 'The object to stringify',
      },
      maxLength: {
        type: 'number',
        description: 'Maximum length of the output string',
        default: 75000,
      },
      prettify: {
        type: 'boolean',
        description: 'Whether to format the JSON with indentation',
        default: false,
      },
      includeMetadata: {
        type: 'boolean',
        description: 'Whether to include execution metadata',
        default: false,
      },
    },
    required: ['obj'],
  },

  async execute(args: SafeStringifyArgs): Promise<MCPToolResponse> {
    try {
      const { obj, maxLength = 75000, prettify = false, includeMetadata = false } = args;

      // Use the pure stringify function which returns metadata
      const result = safeStringifyPure(obj, {
        maxLength,
        prettify,
      });

      // Check if there was an error (result would be error message)
      if (result.result.startsWith('[Stringify Error:')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: result.result }),
            },
          ],
          isError: true,
        };
      }

      // Return structured response expected by tests
      const responseData = {
        result: result.result,
        truncated: result.metadata?.truncated || false,
        circularRefs: result.metadata?.circularRefs || 0,
        originalLength: result.metadata?.originalLength || result.result.length,
        finalLength: result.result.length,
      };

      const response: MCPToolResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(responseData),
          },
        ],
      };

      if (includeMetadata && result.metadata) {
        response.metadata = result.metadata;
      }

      return response;
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Tool Error: ${(error as Error).message}`,
            }),
          },
        ],
        isError: true,
      };
    }
  },
};
