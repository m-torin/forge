/**
 * MCP Tool: Safe Stringify
 * Provides safe JSON stringification with circular reference handling
 * Enhanced with Node.js 22+ streaming capabilities for large objects
 */

import type { MCPToolResponse } from '../types/mcp';
import { SafeStringifier, safeStringifyStream, StreamingStringifyChunk } from '../utils/stringify';
export interface SafeStringifyArgs {
  obj: unknown;
  maxLength?: number;
  prettify?: boolean;
  includeMetadata?: boolean;
  streaming?: boolean;
  chunkSize?: number;
  signal?: AbortSignal;
}

export interface LegacySafeStringifyArgs {
  obj: unknown;
  maxLength?: number;
}

export const safeStringifyTool = {
  name: 'safe_stringify',
  description:
    'Safely stringify objects with circular reference handling, size limits, and formatting options',
  inputSchema: {
    type: 'object',
    properties: {
      obj: {
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
      streaming: {
        type: 'boolean',
        description: 'Enable streaming mode for large objects',
        default: false,
      },
      chunkSize: {
        type: 'number',
        description: 'Size of each streamed chunk',
        default: 1000,
      },
    },
    required: ['obj'],
  },

  async execute(args: SafeStringifyArgs): Promise<MCPToolResponse> {
    try {
      const {
        obj,
        maxLength = 75000,
        prettify = false,
        includeMetadata = false,
        streaming = false,
        chunkSize = 1000,
        signal,
      } = args;

      // Handle streaming mode for large objects
      if (streaming) {
        const chunks: StreamingStringifyChunk[] = [];
        let totalResult = '';

        try {
          for await (const chunk of safeStringifyStream(obj, {
            maxLength,
            prettify,
            includeMetadata: true,
            chunkSize,
            signal,
          })) {
            chunks.push(chunk);
            totalResult += chunk.chunk;

            // Yield control periodically during streaming
            if (chunks.length % 10 === 0) {
              await new Promise(resolve => setImmediate(resolve));
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  streaming: true,
                  chunksProcessed: chunks.length,
                  totalBytes: chunks[chunks.length - 1]?.bytesProcessed || 0,
                  result: totalResult,
                  completed: true,
                  metadata: {
                    streamingMode: true,
                    chunkSize,
                    finalChunkSize: chunks[chunks.length - 1]?.chunk.length || 0,
                  },
                }),
              },
            ],
          };
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    streaming: true,
                    aborted: true,
                    chunksProcessed: chunks.length,
                    partialResult: totalResult,
                    partialBytes: chunks[chunks.length - 1]?.bytesProcessed || 0,
                  }),
                },
              ],
            };
          }
          throw error;
        }
      }

      // Non-streaming mode (original behavior)
      const stringifier = new SafeStringifier({
        maxLength,
        prettify,
        includeMetadata: true, // Always include metadata for structured response
      });

      const result = stringifier.stringify(obj);

      // Check if there was an error during stringification
      if (result.error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: result.result || result.content || 'Unknown error' }),
            },
          ],
          isError: true,
        };
      }

      // Return structured response expected by tests
      const content = result.result || result.content || '';
      const responseData = {
        result: content,
        truncated: result.metadata?.truncated || false,
        circularRefs: result.metadata?.circularRefs || 0,
        originalLength: result.metadata?.originalLength || content.length,
        finalLength: content.length,
      };

      const response: MCPToolResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(responseData),
          },
        ],
      };

      if (result.metadata) {
        response.metadata = result.metadata;
      }

      return response;
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Tool Error: ${(error as Error).message}` }),
          },
        ],
        isError: true,
      };
    }
  },
};

export const legacySafeStringifyTool = {
  name: 'legacy_safe_stringify',
  description: 'Legacy safe stringify function for backward compatibility',
  inputSchema: {
    type: 'object',
    properties: {
      obj: {
        description: 'The object to stringify',
      },
      maxLength: {
        type: 'number',
        description: 'Maximum length of the output string',
        default: 75000,
      },
    },
    required: ['obj'],
  },

  async execute(args: LegacySafeStringifyArgs): Promise<MCPToolResponse> {
    try {
      const { obj, maxLength = 75000 } = args;

      // Use SafeStringifier to get full result info
      const stringifier = new SafeStringifier({ maxLength });
      const result = stringifier.stringify(obj);

      // Check if there was an error during stringification
      if (result.error) {
        return {
          content: [
            {
              type: 'text',
              text: result.result || result.content || 'Unknown error',
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: result.result || result.content || '',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `[Tool Error: ${(error as Error).message}]`,
          },
        ],
        isError: true,
      };
    }
  },
};
