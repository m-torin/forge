import { logError, logInfo } from '@repo/observability/server/next';
import 'server-only';
import { createMCPToolsFromConfigs, type MCPClientConfig } from './client';
import {
  createMCPStreamLifecycleManager,
  type StreamLifecycleConfig,
} from './stream-lifecycle-integration';

/**
 * Helper function to handle async cleanup with error logging
 */
async function performCleanupWithLogging(
  cleanupFn: () => Promise<void>,
  originalError: Error,
  operationType: string,
): Promise<void> {
  try {
    await cleanupFn();
  } catch (closeError) {
    logError('Failed to close MCP clients after error', {
      operation: operationType,
      metadata: {
        originalError: originalError.message,
        closeError: closeError instanceof Error ? closeError.message : String(closeError),
      },
      error: closeError instanceof Error ? closeError : new Error(String(closeError)),
    });
  }
}

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
 * - ✅ AI SDK v5 error handling integration
 * - ✅ Stream lifecycle management
 * - ✅ Uncaught error handling
 *
 * Usage in streamText with AI SDK v5 error handling:
 * ```typescript
 * const { tools, closeAllClients, onUncaughtError } = await createMCPToolsForStreamText(configs);
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
 *   // AI SDK v5 uncaught error handling
 *   onUncaughtError: onUncaughtError,
 * });
 * ```
 */
export async function createMCPToolsForStreamText(configs: MCPClientConfig[]): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
  onUncaughtError: (error: Error) => void;
  onFinish: () => Promise<void>;
}> {
  const result = await createMCPToolsFromConfigs(configs, { gracefulDegradation: true });

  // AI SDK v5 error handling integration
  const onUncaughtError = (error: Error) => {
    logError('MCP uncaught error detected', {
      operation: 'mcp_uncaught_error',
      metadata: {
        errorType: error.name,
        errorMessage: error.message,
        clientCount: result.clients.length,
        toolCount: Object.keys(result.tools).length,
      },
      error,
    });

    // Attempt graceful cleanup on uncaught errors
    void performCleanupWithLogging(
      () => result.closeAllClients(),
      error,
      'mcp_cleanup_after_uncaught_error',
    );
  };

  // Enhanced finish handler for proper lifecycle management
  const onFinish = async () => {
    try {
      await result.closeAllClients();
      logInfo('MCP clients successfully closed on finish', {
        operation: 'mcp_finish_cleanup',
        metadata: {
          clientCount: result.clients.length,
          toolCount: Object.keys(result.tools).length,
        },
      });
    } catch (error) {
      logError('Failed to close MCP clients on finish', {
        operation: 'mcp_finish_cleanup_error',
        metadata: {
          clientCount: result.clients.length,
          error: error instanceof Error ? error.message : String(error),
        },
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error; // Re-throw to maintain AI SDK error handling flow
    }
  };

  return {
    ...result,
    onUncaughtError,
    onFinish,
  };
}

/**
 * Simplified factory for basic MCP setup with AI SDK v5 integration
 * Automatically handles common error cases and provides error callbacks
 */
export async function createMCPToolsWithDefaults(
  configs: MCPClientConfig[],
  options: {
    gracefulDegradation?: boolean;
    logErrors?: boolean;
    includeAISDKCallbacks?: boolean;
  } = {},
): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
  isAvailable: boolean;
  errors: string[];
  onUncaughtError?: (error: Error) => void;
  onFinish?: () => Promise<void>;
}> {
  const { gracefulDegradation = true, logErrors = true, includeAISDKCallbacks = true } = options;
  const errors: string[] = [];
  let tools: Record<string, any> = {};
  let clients: any[] = [];
  let closeAllClients: () => Promise<void> = async () => {};
  let isAvailable = false;
  let onUncaughtError: ((error: Error) => void) | undefined;
  let onFinish: (() => Promise<void>) | undefined;

  if (configs.length === 0) {
    if (logErrors) {
      logInfo('No MCP configs provided', { operation: 'mcp_tools_creation' });
    }
    return { tools, clients, closeAllClients, isAvailable, errors, onUncaughtError, onFinish };
  }

  try {
    const result = await createMCPToolsFromConfigs(configs, { gracefulDegradation });
    tools = result.tools;
    clients = result.clients;
    closeAllClients = result.closeAllClients;
    isAvailable = Object.keys(tools).length > 0;

    // Create AI SDK v5 error handling callbacks if requested
    if (includeAISDKCallbacks) {
      onUncaughtError = (error: Error) => {
        if (logErrors) {
          logError('MCP uncaught error in defaults setup', {
            operation: 'mcp_defaults_uncaught_error',
            metadata: {
              errorType: error.name,
              errorMessage: error.message,
              clientCount: clients.length,
              toolCount: Object.keys(tools).length,
            },
            error,
          });
        }

        // Graceful cleanup
        if (logErrors) {
          void performCleanupWithLogging(closeAllClients, error, 'mcp_defaults_cleanup_error');
        } else {
          void (async () => {
            try {
              await closeAllClients();
            } catch {
              // Silent cleanup
            }
          })();
        }
      };

      onFinish = async () => {
        try {
          await closeAllClients();
          if (logErrors) {
            logInfo('MCP clients closed successfully on finish (defaults)', {
              operation: 'mcp_defaults_finish_cleanup',
              metadata: {
                clientCount: clients.length,
                toolCount: Object.keys(tools).length,
              },
            });
          }
        } catch (error) {
          if (logErrors) {
            logError('Failed to close MCP clients on finish (defaults)', {
              operation: 'mcp_defaults_finish_error',
              metadata: {
                clientCount: clients.length,
                error: error instanceof Error ? error.message : String(error),
              },
              error: error instanceof Error ? error : new Error(String(error)),
            });
          }
          throw error;
        }
      };
    }

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
      logError('MCP tools failed to load', {
        operation: 'mcp_tools_creation',
        errorMessage,
        error: error instanceof Error ? error : new Error(errorMessage),
      });
    }

    if (!gracefulDegradation) {
      throw error;
    }
  }

  return { tools, clients, closeAllClients, isAvailable, errors, onUncaughtError, onFinish };
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

/**
 * Advanced MCP tools factory with full AI SDK v5 stream lifecycle management
 * Provides comprehensive error handling, monitoring, and resource management
 */
export async function createMCPToolsWithStreamLifecycle(
  configs: MCPClientConfig[],
  lifecycleConfig?: Partial<StreamLifecycleConfig>,
): Promise<{
  tools: Record<string, any>;
  clients: any[];
  closeAllClients: () => Promise<void>;
  onUncaughtError: (error: Error) => void;
  onFinish: () => Promise<void>;
  streamCallbacks: {
    onStart: () => void;
    onProgress: (data: any) => void;
    onFinish: (event: any) => Promise<void>;
    onError: (error: Error) => Promise<void>;
    onUncaughtError: (error: Error) => void;
    onAbort: () => void;
  };
  lifecycleManager: {
    getStatus: () => any;
    requestAbort: () => void;
  };
}> {
  // Create stream lifecycle manager
  const lifecycleManager = createMCPStreamLifecycleManager(configs, lifecycleConfig);

  // Initialize with full lifecycle management
  const { tools, clients, streamCallbacks } = await lifecycleManager.initialize();

  // Create enhanced cleanup function
  const closeAllClients = async () => {
    try {
      await streamCallbacks.onFinish({});
    } catch (error) {
      logError('Failed to close MCP clients via lifecycle manager', {
        operation: 'mcp_lifecycle_cleanup_error',
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: {
          clientCount: clients.length,
          toolCount: Object.keys(tools).length,
        },
      });
      throw error;
    }
  };

  // Create compatible onFinish that matches expected signature
  const compatibleOnFinish = async () => {
    await streamCallbacks.onFinish({});
  };

  return {
    tools,
    clients,
    closeAllClients,
    onUncaughtError: streamCallbacks.onUncaughtError,
    onFinish: compatibleOnFinish,
    streamCallbacks,
    lifecycleManager: {
      getStatus: lifecycleManager.getStatus.bind(lifecycleManager),
      requestAbort: lifecycleManager.requestAbort.bind(lifecycleManager),
    },
  };
}
