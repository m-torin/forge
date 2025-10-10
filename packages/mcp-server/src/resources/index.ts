import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServerConfig } from '../config';
import { ALL_TOOLS } from '../tools';

export function registerStandardResources(server: McpServer, config: McpServerConfig) {
  const templateHandles: never[] = [];
  let resourceCount = 0;

  server.registerResource(
    'runtime-config',
    'forge://config/runtime',
    {
      title: 'Runtime configuration',
      description: 'Expanded MCP server configuration resolved at startup.',
      mimeType: 'application/json',
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              name: config.serverName,
              version: config.serverVersion,
              transports: config.transports,
              http: {
                port: config.httpPort,
                enableSse: config.enableSse,
              },
              logLevel: config.logLevel,
            },
            null,
            2,
          ),
        },
      ],
    }),
  );
  resourceCount += 1;

  server.registerResource(
    'tool-catalog',
    'forge://catalog/tools',
    {
      title: 'Available tools',
      description: 'Catalog of registered MCP tools with descriptive metadata.',
      mimeType: 'application/json',
    },
    async uri => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(
            ALL_TOOLS.map(toolName => ({
              name: toolName,
              title: toolName
                .split('_')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' '),
              description: `Registered MCP tool: ${toolName}`,
            })),
            null,
            2,
          ),
        },
      ],
    }),
  );
  resourceCount += 1;

  return {
    resourceCount,
    templateHandles,
  };
}
