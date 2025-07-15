/**
 * MCP Tool: Safe Stringify
 * Provides safe JSON stringification with circular reference handling
 */

import { SafeStringifier, safeStringify } from '../utils/stringify';

export interface SafeStringifyArgs {
  obj: any;
  maxLength?: number;
  prettify?: boolean;
  includeMetadata?: boolean;
}

export interface LegacySafeStringifyArgs {
  obj: any;
  maxLength?: number;
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
  description: 'Safely stringify objects with circular reference handling, size limits, and formatting options',
  inputSchema: {
    type: 'object',
    properties: {
      obj: {
        description: 'The object to stringify'
      },
      maxLength: {
        type: 'number',
        description: 'Maximum length of the output string',
        default: 75000
      },
      prettify: {
        type: 'boolean',
        description: 'Whether to format the JSON with indentation',
        default: false
      },
      includeMetadata: {
        type: 'boolean',
        description: 'Whether to include execution metadata',
        default: false
      }
    },
    required: ['obj']
  },

  async execute(args: SafeStringifyArgs): Promise<MCPToolResponse> {
    try {
      const { obj, maxLength = 75000, prettify = false, includeMetadata = false } = args;
      
      const stringifier = new SafeStringifier({
        maxLength,
        prettify,
        includeMetadata
      });
      
      const result = stringifier.stringify(obj);
      
      const response: MCPToolResponse = {
        content: [
          {
            type: 'text',
            text: result.content
          }
        ]
      };
      
      if (result.metadata) {
        response.metadata = result.metadata;
      }
      
      if (result.error) {
        response.isError = true;
      }
      
      return response;
      
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `[Tool Error: ${(error as Error).message}]`
          }
        ],
        isError: true
      };
    }
  }
};

export const legacySafeStringifyTool = {
  name: 'legacy_safe_stringify',
  description: 'Legacy safe stringify function for backward compatibility',
  inputSchema: {
    type: 'object',
    properties: {
      obj: {
        description: 'The object to stringify'
      },
      maxLength: {
        type: 'number',
        description: 'Maximum length of the output string',
        default: 75000
      }
    },
    required: ['obj']
  },

  async execute(args: LegacySafeStringifyArgs): Promise<MCPToolResponse> {
    try {
      const { obj, maxLength = 75000 } = args;
      const result = safeStringify(obj, maxLength);
      
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `[Tool Error: ${(error as Error).message}]`
          }
        ],
        isError: true
      };
    }
  }
};