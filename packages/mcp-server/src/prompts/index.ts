import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ALL_TOOLS } from '../tools';

export function registerStandardPrompts(server: McpServer) {
  const promptHandles = [];

  promptHandles.push(
    server.registerPrompt(
      'tool-discovery-brief',
      {
        title: 'Describe MCP tools',
        description: 'Creates a short brief on the available MCP tools.',
        argsSchema: {
          audience: z
            .enum(['engineer', 'analyst', 'agent'])
            .describe('Audience persona for the brief')
            .optional(),
        } as any,
      },
      (({ audience }: any) => {
        const brief = ALL_TOOLS.map(name => `- ${name}`).join('\n');
        const persona = audience
          ? `Write for a ${audience} audience.`
          : 'Write for a general audience.';

        return {
          description: 'Prompt template for briefing the available tools.',
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text',
                text: `${persona} Keep the response under 150 words. Summarize these MCP tools:\n${brief}`,
              },
            },
          ],
        } as any;
      }) as any,
    ),
  );

  return {
    promptHandles,
    promptCount: promptHandles.length,
  };
}
