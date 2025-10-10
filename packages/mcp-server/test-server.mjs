#!/usr/bin/env node

/**
 * Minimal MCP server test
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function main() {
  const server = new Server(
    {
      name: 'test-server',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Use the newer MCP SDK API pattern
  server.setRequestHandler(
    { method: 'tools/list' },
    async () => {
      return {
        tools: [
          {
            name: 'test_tool',
            description: 'A test tool',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string' }
              }
            }
          }
        ]
      };
    }
  );

  server.setRequestHandler(
    { method: 'tools/call' },
    async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name === 'test_tool') {
        return {
          content: [
            {
              type: 'text',
              text: `Test tool called with: ${args.message || 'no message'}`
            }
          ]
        };
      }
      
      throw new Error(`Unknown tool: ${name}`);
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Test MCP server running');
}

main().catch(console.error);