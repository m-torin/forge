import { logError, logInfo } from '@repo/observability/server/next';
import 'server-only';
import { createMCPToolsFromConfigs, type MCPClientConfig } from './client';

/**
 * Next.js streamText-compatible MCP tools factory
 * Follows the exact pattern from Next.js documentation:
 * https://sdk.vercel.ai/docs/ai-sdk-ui/mcp-tools
 *
 * This implementation supports:
 * - ✅ stdio transport (local processes)
 * - ✅ SSE transport (Server-Sent Events)
 * - ✅ HTTP transport (StreamableHTTP from @modelcontextprotocol/sdk)
 * - ✅ Per-request client creation and cleanup
 * - ✅ Graceful degradation when servers are unavailable
 * - ✅ Environment-based configuration
 *
 * Usage in streamText:
 * ```typescript
 * const { tools, closeAllClients } = await createMCPToolsForStreamText(configs);
 *
 * const result = streamText({
 *   model: openai('gpt-4o'),
 *   tools: {
 *     // Built-in tools
 *     someBuiltinTool,
 *     // MCP tools (following official docs pattern)
 *     ...tools,
 *   },
 *   prompt: 'Your prompt here',
 *   onFinish: async () => {
 *     await closeAllClients();
 *   },
 *   onError: (error) => {
 *     closeAllClients().catch((closeError) => {
 *       logError('Failed to close MCP clients on error', closeError instanceof Error ? closeError : new Error(String(closeError)));
 *     });
 *   },
 * });
 * ```
 */
export async function createMCPToolsForStreamText(configs: MCPClientConfig[]): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
}> {
  return createMCPToolsFromConfigs(configs, { gracefulDegradation: true });
}

/**
 * Simplified factory for basic MCP setup
 * Automatically handles common error cases
 */
export async function createMCPToolsWithDefaults(
  configs: MCPClientConfig[],
  options: {
    gracefulDegradation?: boolean;
    logErrors?: boolean;
  } = {},
): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
  isAvailable: boolean;
  errors: string[];
}> {
  const { gracefulDegradation = true, logErrors = true } = options;
  const errors: string[] = [];
  let tools: Record<string, any> = {};
  let clients: any[] = [];
  let closeAllClients: () => Promise<void> = async () => {};
  let isAvailable = false;

  if (configs.length === 0) {
    if (logErrors) {
      logInfo('No MCP configs provided', { operation: 'mcp_tools_creation' });
    }
    return { tools, clients, closeAllClients, isAvailable, errors };
  }

  try {
    const result = await createMCPToolsFromConfigs(configs, { gracefulDegradation });
    tools = result.tools;
    clients = result.clients;
    closeAllClients = result.closeAllClients;
    isAvailable = Object.keys(tools).length > 0;

    if (logErrors && isAvailable) {
      logInfo(`MCP tools loaded: ${Object.keys(tools).join(', ')}`, {
        toolCount: Object.keys(tools).length,
        toolNames: Object.keys(tools),
        operation: 'mcp_tools_creation',
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown MCP error';
    errors.push(errorMessage);

    if (logErrors) {
      logError(
        'MCP tools failed to load',
        error instanceof Error ? error : new Error(errorMessage),
        {
          operation: 'mcp_tools_creation',
          errorMessage,
        },
      );
    }

    if (!gracefulDegradation) {
      throw error;
    }
  }

  return { tools, clients, closeAllClients, isAvailable, errors };
}

/**
 * Test MCP connectivity without creating persistent connections
 */
export async function testMCPConnectivity(configs: MCPClientConfig[]): Promise<{
  results: Array<{
    name: string;
    success: boolean;
    error?: string;
    toolCount: number;
  }>;
  overallSuccess: boolean;
}> {
  const results: Array<{
    name: string;
    success: boolean;
    error?: string;
    toolCount: number;
  }> = [];

  for (const config of configs) {
    try {
      const { tools, closeAllClients } = await createMCPToolsFromConfigs([config]);
      const toolCount = Object.keys(tools).length;

      results.push({
        name: config.name,
        success: true,
        toolCount,
      });

      // Clean up immediately
      await closeAllClients();
    } catch (error) {
      results.push({
        name: config.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        toolCount: 0,
      });
    }
  }

  const overallSuccess = results.every(r => r.success);
  return { results, overallSuccess };
}
