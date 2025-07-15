import { logError, logWarn } from '@repo/observability/server/next';
import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
import {
  AISDKCompatibleMCPError,
  MCPErrorHandlerFactory,
  MCPErrorUtils,
} from './ai-sdk-error-integration';

export interface MCPClientConfig {
  name: string;
  transport: MCPTransportConfig;
  retry?: MCPRetryConfig;
  timeoutMs?: number;
  gracefulDegradation?: boolean;
  healthCheck?: MCPHealthCheckConfig;
}

export interface MCPTransportConfig {
  type: 'stdio' | 'sse' | 'http';
  // For stdio transport
  command?: string;
  args?: string[];
  // For SSE transport
  url?: string;
  headers?: Record<string, string>;
  // For HTTP transport
  httpUrl?: string;
  sessionId?: string;
}

/**
 * MCP Client wrapper with proper typing
 * Uses AI SDK tool format instead of MCP SDK format
 */
export interface MCPClient {
  tools(): Promise<Record<string, any>>;
  close(): Promise<void>;
}

/**
 * MCP Transport union type for better type safety
 */
export type MCPTransport =
  | Experimental_StdioMCPTransport
  | { type: 'sse'; url: string; headers?: Record<string, string> };

/**
 * Retry configuration for MCP operations
 */
export interface MCPRetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: MCPRetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['ECONNREFUSED', 'ENOTFOUND', 'TIMEOUT', 'NETWORK_ERROR', 'CONNECTION_LOST'],
};

/**
 * Health check configuration for MCP servers
 */
export interface MCPHealthCheckConfig {
  enabled: boolean;
  intervalMs: number;
  timeoutMs: number;
  failureThreshold: number;
  recoveryThreshold: number;
}

/**
 * Default health check configuration
 */
export const DEFAULT_HEALTH_CHECK_CONFIG: MCPHealthCheckConfig = {
  enabled: true,
  intervalMs: 60000, // 1 minute
  timeoutMs: 5000, // 5 seconds
  failureThreshold: 3,
  recoveryThreshold: 2,
};

/**
 * Health status for MCP servers
 */
export enum MCPHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

/**
 * Health check result
 */
export interface MCPHealthCheckResult {
  status: MCPHealthStatus;
  lastCheck: Date;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  responseTimeMs?: number;
  error?: string;
}

/**
 * Result type for MCP client creation
 */
export interface MCPClientResult {
  client: MCPClient;
  toolSet: Record<string, any>;
  config: MCPClientConfig;
}

/**
 * MCP Error types for better error handling
 */
export class MCPConnectionError extends Error {
  constructor(
    message: string,
    public readonly clientName: string,
    public readonly transportType: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'MCPConnectionError';
  }
}

export class MCPTransportError extends Error {
  constructor(
    message: string,
    public readonly transportType: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'MCPTransportError';
  }
}

export class MCPRetryableError extends Error {
  constructor(
    message: string,
    public readonly attempt: number,
    public readonly maxAttempts: number,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'MCPRetryableError';
  }
}

/**
 * Utility function to check if an error is retryable
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  // Check error message for known patterns
  const errorMessage = error.message.toUpperCase();
  const errorCode = (error as any).code;

  return retryableErrors.some(
    pattern => errorMessage.includes(pattern.toUpperCase()) || errorCode === pattern,
  );
}

/**
 * Utility function to calculate exponential backoff delay
 */
function calculateDelay(attempt: number, config: MCPRetryConfig): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelayMs);
}

/**
 * Utility function to sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Timeout wrapper that cancels operations after a specified duration
 */
async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  context: string = 'MCP operation',
): Promise<T> {
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`${context} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([operation(), timeoutPromise]);
}

/**
 * Enhanced retry wrapper with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  config: MCPRetryConfig = DEFAULT_RETRY_CONFIG,
  context: string = 'MCP operation',
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt or error is not retryable, throw
      if (attempt === config.maxAttempts || !isRetryableError(lastError, config.retryableErrors)) {
        logError(`${context} failed after ${attempt} attempts`, {
          operation: 'mcp_retry_exhausted',
          metadata: {
            context,
            attempt,
            maxAttempts: config.maxAttempts,
            error: lastError.message,
          },
          error: lastError,
        });
        throw lastError;
      }

      // Calculate delay and wait before retry
      const delay = calculateDelay(attempt, config);
      logWarn(
        `${context} failed, retrying in ${delay}ms (attempt ${attempt}/${config.maxAttempts})`,
        {
          operation: 'mcp_retry_attempt',
          metadata: {
            context,
            attempt,
            maxAttempts: config.maxAttempts,
            delayMs: delay,
            error: lastError.message,
          },
        },
      );

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs this
  throw lastError || new Error(`${context} failed after all retry attempts`);
}

/**
 * Combined retry and timeout wrapper
 */
export async function withRetryAndTimeout<T>(
  operation: () => Promise<T>,
  retryConfig: MCPRetryConfig = DEFAULT_RETRY_CONFIG,
  timeoutMs?: number,
  context: string = 'MCP operation',
): Promise<T> {
  const wrappedOperation = timeoutMs ? () => withTimeout(operation, timeoutMs, context) : operation;

  return withRetry(wrappedOperation, retryConfig, context);
}

/**
 * MCP Server Health Monitor
 * Tracks health status of MCP servers and provides graceful degradation
 */
export class MCPHealthMonitor {
  private healthStatuses = new Map<string, MCPHealthCheckResult>();
  private healthCheckIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Start health monitoring for a client configuration
   */
  startMonitoring(config: MCPClientConfig): void {
    const healthConfig = config.healthCheck || DEFAULT_HEALTH_CHECK_CONFIG;
    if (!healthConfig.enabled) return;

    // Initialize health status
    this.healthStatuses.set(config.name, {
      status: MCPHealthStatus.UNKNOWN,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    });

    // Set up periodic health checks
    const intervalId = setInterval(async () => {
      await this.performHealthCheck(config);
    }, healthConfig.intervalMs);

    this.healthCheckIntervals.set(config.name, intervalId);

    // Perform initial health check
    this.performHealthCheck(config);
  }

  /**
   * Stop health monitoring for a client
   */
  stopMonitoring(clientName: string): void {
    const intervalId = this.healthCheckIntervals.get(clientName);
    if (intervalId) {
      clearInterval(intervalId);
      this.healthCheckIntervals.delete(clientName);
    }
    this.healthStatuses.delete(clientName);
  }

  /**
   * Get current health status for a client
   */
  getHealthStatus(clientName: string): MCPHealthCheckResult | undefined {
    return this.healthStatuses.get(clientName);
  }

  /**
   * Check if a client is currently healthy
   */
  isHealthy(clientName: string): boolean {
    const status = this.healthStatuses.get(clientName);
    return status?.status === MCPHealthStatus.HEALTHY;
  }

  /**
   * Check if a client should be excluded due to poor health
   */
  shouldExclude(clientName: string): boolean {
    const status = this.healthStatuses.get(clientName);
    return status?.status === MCPHealthStatus.UNHEALTHY;
  }

  /**
   * Perform a health check for a specific client
   */
  private async performHealthCheck(config: MCPClientConfig): Promise<void> {
    const healthConfig = config.healthCheck || DEFAULT_HEALTH_CHECK_CONFIG;
    const startTime = Date.now();
    let result: MCPHealthCheckResult;

    try {
      // Attempt to create a temporary client and get tools
      await withTimeout(
        async () => {
          const transport = createTransportFromConfig(config.transport);
          const tempClient = (await experimental_createMCPClient({ transport })) as any;

          try {
            await tempClient.tools();
            await tempClient.close();
          } catch (toolError) {
            await tempClient.close();
            throw toolError;
          }
        },
        healthConfig.timeoutMs,
        `Health check for ${config.name}`,
      );

      // Health check succeeded
      const responseTime = Date.now() - startTime;
      const currentStatus = this.healthStatuses.get(config.name);

      result = {
        status: MCPHealthStatus.HEALTHY,
        lastCheck: new Date(),
        consecutiveFailures: 0,
        consecutiveSuccesses: (currentStatus?.consecutiveSuccesses || 0) + 1,
        responseTimeMs: responseTime,
      };
    } catch (error) {
      // Health check failed
      const currentStatus = this.healthStatuses.get(config.name);
      const consecutiveFailures = (currentStatus?.consecutiveFailures || 0) + 1;

      let newStatus: MCPHealthStatus;
      if (consecutiveFailures >= healthConfig.failureThreshold) {
        newStatus = MCPHealthStatus.UNHEALTHY;
      } else if (consecutiveFailures > 1) {
        newStatus = MCPHealthStatus.DEGRADED;
      } else {
        newStatus = MCPHealthStatus.DEGRADED;
      }

      result = {
        status: newStatus,
        lastCheck: new Date(),
        consecutiveFailures,
        consecutiveSuccesses: 0,
        error: error instanceof Error ? error.message : String(error),
      };

      logWarn(`Health check failed for MCP client '${config.name}'`, {
        operation: 'mcp_health_check_failed',
        metadata: {
          clientName: config.name,
          consecutiveFailures,
          status: newStatus,
          error: result.error,
        },
      });
    }

    // Update health status
    this.healthStatuses.set(config.name, result);

    // Log health status changes
    const previousStatus = this.healthStatuses.get(config.name);
    if (previousStatus && previousStatus.status !== result.status) {
      logWarn(
        `MCP client '${config.name}' health status changed: ${previousStatus.status} → ${result.status}`,
        {
          operation: 'mcp_health_status_change',
          metadata: {
            clientName: config.name,
            previousStatus: previousStatus.status,
            newStatus: result.status,
            consecutiveFailures: result.consecutiveFailures,
            consecutiveSuccesses: result.consecutiveSuccesses,
          },
        },
      );
    }
  }

  /**
   * Get summary of all client health statuses
   */
  getHealthSummary(): Record<string, MCPHealthCheckResult> {
    return Object.fromEntries(this.healthStatuses);
  }

  /**
   * Cleanup all monitoring
   */
  cleanup(): void {
    // Clear all intervals
    for (const intervalId of this.healthCheckIntervals.values()) {
      clearInterval(intervalId);
    }
    this.healthCheckIntervals.clear();
    this.healthStatuses.clear();
  }
}

/**
 * Global health monitor instance
 */
export const globalMCPHealthMonitor = new MCPHealthMonitor();

/**
 * Validate transport configuration at runtime
 */
function validateTransportConfig(transportConfig: MCPTransportConfig): void {
  switch (transportConfig.type) {
    case 'stdio':
      if (!transportConfig.command) {
        throw new MCPTransportError('Command is required for stdio transport', 'stdio');
      }
      break;
    case 'sse':
      if (!transportConfig.url) {
        throw new MCPTransportError('URL is required for SSE transport', 'sse');
      }
      try {
        new URL(transportConfig.url);
      } catch {
        throw new MCPTransportError('Invalid URL format for SSE transport', 'sse');
      }
      break;
    case 'http':
      if (!transportConfig.httpUrl) {
        throw new MCPTransportError('HTTP URL is required for HTTP transport', 'http');
      }
      try {
        new URL(transportConfig.httpUrl);
      } catch {
        throw new MCPTransportError('Invalid HTTP URL format for HTTP transport', 'http');
      }
      break;
    default:
      throw new MCPTransportError(
        `Unsupported transport type: ${(transportConfig as any).type}`,
        'unknown',
      );
  }
}

/**
 * Create transport instance from configuration with proper typing and validation
 */
export function createTransportFromConfig(transportConfig: MCPTransportConfig): MCPTransport {
  // Validate configuration first
  validateTransportConfig(transportConfig);

  switch (transportConfig.type) {
    case 'stdio':
      return new Experimental_StdioMCPTransport({
        command: transportConfig.command || 'node',
        args: transportConfig.args || [],
        env: {
          ...process.env,
          // Ensure API keys are passed to child processes
          ...(process.env.PERPLEXITY_API_KEY && {
            PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
          }),
          ...(process.env.OPENAI_API_KEY && { OPENAI_API_KEY: process.env.OPENAI_API_KEY }),
          ...(process.env.ANTHROPIC_API_KEY && {
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          }),
        },
      });

    case 'sse':
      return {
        type: 'sse' as const,
        url: transportConfig.url || 'http://localhost:3001',
        headers: transportConfig.headers,
      };

    case 'http':
      // HTTP transport not available in current AI SDK version
      throw new Error('HTTP transport not currently supported. Use stdio or sse instead.');

    default:
      // TypeScript should catch this, but runtime safety
      throw new MCPTransportError(
        `Unsupported transport type: ${(transportConfig as any).type}`,
        'unknown',
      );
  }
}

/**
 * Per-request MCP client manager following Next.js documentation pattern with AI SDK v5 integration
 * Creates clients per request and cleans them up automatically with proper error handling
 */
export class MCPRequestManager {
  public clients: MCPClient[] = [];
  private tools: Record<string, any> = {};
  private errorHandlers: Map<string, MCPErrorHandlerFactory> = new Map();

  async addClient(config: MCPClientConfig): Promise<void> {
    const retryConfig = config.retry || DEFAULT_RETRY_CONFIG;
    const timeoutMs = config.timeoutMs || 30000; // 30 second default timeout
    const context = `MCP client creation (${config.name})`;

    // Create AI SDK error handler for this client
    const errorHandler = new MCPErrorHandlerFactory(config.name, context);
    this.errorHandlers.set(config.name, errorHandler);

    // Check health status if health monitoring is enabled
    if (globalMCPHealthMonitor.shouldExclude(config.name)) {
      if (config.gracefulDegradation) {
        logWarn(`Skipping unhealthy MCP client '${config.name}'`, {
          operation: 'mcp_skip_unhealthy',
          metadata: {
            clientName: config.name,
            healthStatus: globalMCPHealthMonitor.getHealthStatus(config.name),
          },
        });
        return;
      } else {
        throw new AISDKCompatibleMCPError(
          `MCP client '${config.name}' is marked as unhealthy`,
          'connection-error',
          undefined,
          {
            clientName: config.name,
            transportType: config.transport.type,
            healthStatus: globalMCPHealthMonitor.getHealthStatus(config.name),
          },
          true, // This is recoverable - health might improve
        );
      }
    }

    try {
      await withRetryAndTimeout(
        async () => {
          const transport = createTransportFromConfig(config.transport);
          const client = (await experimental_createMCPClient({ transport })) as any;
          this.clients.push(client);

          // Get tools from this client and merge them with retry
          const clientTools = await withRetryAndTimeout(
            () => client.tools(),
            retryConfig,
            timeoutMs,
            `MCP tools retrieval (${config.name})`,
          );

          // Merge tools directly (later tools override earlier ones with same name)
          Object.assign(this.tools, clientTools);

          // Start health monitoring for this client
          globalMCPHealthMonitor.startMonitoring(config);
        },
        retryConfig,
        timeoutMs,
        context,
      );
    } catch (error) {
      const originalError = error instanceof Error ? error : new Error(String(error));
      const aiError = new AISDKCompatibleMCPError(
        `Failed to create MCP client '${config.name}' after retries`,
        'connection-error',
        originalError,
        {
          clientName: config.name,
          transportType: config.transport.type,
          retryAttempts: retryConfig.maxAttempts,
          timeoutMs,
        },
        MCPErrorUtils.isRecoverableError(originalError),
      );

      // If graceful degradation is enabled, log and continue
      if (config.gracefulDegradation) {
        logWarn(`MCP client '${config.name}' failed, continuing with degraded functionality`, {
          operation: 'mcp_graceful_degradation',
          metadata: {
            clientName: config.name,
            transportType: config.transport.type,
            error: aiError.message,
            errorType: aiError.errorType,
            recoverable: aiError.recoverable,
            ...MCPErrorUtils.extractErrorMetadata(originalError),
          },
        });
        return;
      }

      throw aiError;
    }
  }

  getTools(): Record<string, any> {
    return this.tools;
  }

  async close(): Promise<void> {
    const closePromises = this.clients.map(async (client, index) => {
      try {
        await client.close();
      } catch (error) {
        logWarn(`Failed to close MCP client ${index}`, {
          operation: 'mcp_client_close',
          metadata: {
            clientIndex: index,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    });

    await Promise.all(closePromises);
    this.clients = [];
    this.tools = {};
  }

  /**
   * Get health summary for all managed clients
   */
  getHealthSummary(): Record<string, MCPHealthCheckResult> {
    return globalMCPHealthMonitor.getHealthSummary();
  }

  /**
   * Create AI SDK v5 compatible error handlers for all managed clients
   */
  createAISDKErrorHandlers(): {
    onUncaughtError: (error: Error) => void;
    onFinish: () => Promise<void>;
    onStreamError: (error: Error) => void;
  } {
    const onUncaughtError = (error: Error) => {
      // Create a composite error handler that handles all clients
      for (const [_clientName, errorHandler] of this.errorHandlers.entries()) {
        const handler = errorHandler.createUncaughtErrorHandler(() => this.close(), {
          enableRecovery: true,
          maxRecoveryAttempts: 1,
        });
        handler(error);
      }
    };

    const onFinish = async () => {
      try {
        await this.close();
      } catch (error) {
        // Convert to AI SDK compatible error
        const aiError = new AISDKCompatibleMCPError(
          'Failed to close MCP clients on finish',
          'resource-exhausted',
          error instanceof Error ? error : new Error(String(error)),
          {
            clientCount: this.clients.length,
            operation: 'finish_cleanup',
          },
          false,
        );
        throw aiError;
      }
    };

    const onStreamError = (error: Error) => {
      // Handle stream errors for all clients
      for (const [_clientName, errorHandler] of this.errorHandlers.entries()) {
        const handler = errorHandler.createStreamErrorHandler(() => this.close());
        handler(error);
      }
    };

    return {
      onUncaughtError,
      onFinish,
      onStreamError,
    };
  }
}

/**
 * Create MCP tools for a single request (following Next.js docs pattern)
 * This creates clients per request and returns cleanup functions
 */
export async function createMCPToolsForRequest(configs: MCPClientConfig[]): Promise<{
  tools: Record<string, any>;
  clients: MCPClient[];
  cleanup: () => Promise<void>;
}> {
  const manager = new MCPRequestManager();

  for (const config of configs) {
    await manager.addClient(config);
  }

  return {
    tools: manager.getTools(),
    clients: manager.clients,
    cleanup: () => manager.close(),
  };
}

/**
 * Create MCP tools following the exact Next.js documentation pattern
 * This function matches the pattern shown in the official AI SDK docs:
 * https://sdk.vercel.ai/docs/ai-sdk-ui/mcp-tools (Next.js usage)
 * https://sdk.vercel.ai/docs/ai-sdk-core/mcp-tools (Node.js usage)
 *
 * Next.js streamText example from official docs:
 * ```typescript
 * const toolSetOne = await stdioClient.tools();
 * const toolSetTwo = await sseClient.tools();
 * const toolSetThree = await customClient.tools();
 * const tools = {
 *   ...toolSetOne,
 *   ...toolSetTwo,
 *   ...toolSetThree, // note: this approach causes subsequent tool sets to override tools with the same name
 * };
 *
 * const response = await streamText({
 *   model: openai('gpt-4o'),
 *   tools,
 *   prompt,
 *   onFinish: async () => {
 *     await stdioClient.close();
 *     await sseClient.close();
 *     await customClient.close();
 *   },
 * });
 * ```
 */
export async function createMCPToolsFromConfigs(
  configs: MCPClientConfig[],
  options: { gracefulDegradation?: boolean } = {},
): Promise<{
  tools: Record<string, any>;
  clients: MCPClient[];
  closeAllClients: () => Promise<void>;
}> {
  const clients: MCPClient[] = [];
  const toolSets: Record<string, any>[] = [];

  // Create all clients in parallel for better performance
  const clientPromises = configs.map(async (config): Promise<MCPClientResult | null> => {
    const retryConfig = config.retry || DEFAULT_RETRY_CONFIG;
    const timeoutMs = config.timeoutMs || 30000;
    const enableGracefulDegradation =
      config.gracefulDegradation ?? options.gracefulDegradation ?? false;
    let client: any = null;

    try {
      const result = await withRetryAndTimeout(
        async (): Promise<MCPClientResult> => {
          const transport = createTransportFromConfig(config.transport);

          // Create MCP client with transport (following official docs pattern)
          client = (await experimental_createMCPClient({ transport })) as any;

          // Get tools from this client before adding to clients array
          if (!client) throw new Error('Failed to create MCP client');

          const toolSet = await withRetryAndTimeout(
            () => (client?.tools() as Promise<Record<string, any>>) ?? Promise.resolve({}),
            retryConfig,
            timeoutMs,
            `MCP tools retrieval (${config.name})`,
          );

          return { client, toolSet, config };
        },
        retryConfig,
        timeoutMs,
        `MCP client creation (${config.name})`,
      );

      return result;
    } catch (error) {
      // Close the client if it was created but tool retrieval failed
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          logError(`Failed to close failed client ${config.name}`, {
            operation: 'mcp_client_cleanup',
            metadata: { clientName: config.name },
            error: closeError instanceof Error ? closeError : new Error(String(closeError)),
          });
        }
      }

      const mcpError = new MCPConnectionError(
        `Failed to create MCP client '${config.name}' after retries`,
        config.name,
        config.transport.type,
        error instanceof Error ? error : new Error(String(error)),
      );

      if (enableGracefulDegradation) {
        logWarn(
          `Failed to create MCP client ${config.name}, continuing with degraded functionality`,
          {
            operation: 'mcp_client_creation_degraded',
            metadata: {
              clientName: config.name,
              transportType: config.transport.type,
              retryAttempts: retryConfig.maxAttempts,
              timeoutMs,
              error: mcpError.message,
            },
          },
        );
        // Return null to filter out later
        return null;
      } else {
        // Re-throw error if not using graceful degradation
        throw mcpError;
      }
    }
  });

  // Wait for all clients to be created
  const results = await Promise.all(clientPromises);

  // Filter out failed clients and populate arrays
  for (const result of results) {
    if (result) {
      clients.push(result.client);
      toolSets.push(result.toolSet);
    }
  }

  // Merge all tool sets using explicit spread operator (following Next.js docs pattern)
  // Note: this approach causes subsequent tool sets to override tools with the same name
  const tools: Record<string, any> =
    toolSets.length === 0
      ? {}
      : toolSets.length === 1
        ? { ...toolSets[0] }
        : toolSets.length === 2
          ? { ...toolSets[0], ...toolSets[1] }
          : toolSets.length === 3
            ? { ...toolSets[0], ...toolSets[1], ...toolSets[2] }
            : // For 4+ clients, fall back to Object.assign (less common scenario)
              Object.assign({}, ...toolSets);

  // Enhanced cleanup function with better error handling
  const closeAllClients = async (): Promise<void> => {
    const closePromises = clients.map(async (client, index) => {
      try {
        await client.close();
      } catch (error) {
        logWarn(`Failed to close MCP client ${index}`, {
          operation: 'mcp_client_close',
          metadata: {
            clientIndex: index,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    });

    await Promise.all(closePromises);
  };

  return {
    tools,
    clients,
    closeAllClients,
  };
}
