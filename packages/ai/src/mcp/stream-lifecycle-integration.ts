import { logError, logInfo, logWarn } from "@repo/observability/server/next";
import "server-only";
import {
  AISDKCompatibleMCPError,
  MCPErrorHandlerFactory,
} from "./ai-sdk-error-integration";
import { MCPClientConfig } from "./client";

/**
 * AI SDK v5 Stream Lifecycle Integration for MCP
 *
 * Provides comprehensive stream lifecycle management that integrates with AI SDK v5
 * streaming patterns and ensures proper resource cleanup throughout the stream lifecycle.
 *
 * Key Features:
 * - Stream initialization with MCP client setup
 * - Streaming event handling (onStart, onProgress, onComplete)
 * - Stream error recovery and fallback mechanisms
 * - Proper resource cleanup at stream end
 * - Integration with AI SDK v5 streaming callbacks
 * - Memory management during long streams
 * - Stream abort handling
 */

/**
 * Stream lifecycle phases for proper state management
 */
export enum StreamLifecyclePhase {
  INITIALIZING = "initializing",
  CONNECTED = "connected",
  STREAMING = "streaming",
  PAUSED = "paused",
  COMPLETING = "completing",
  COMPLETED = "completed",
  ERROR = "error",
  ABORTED = "aborted",
  CLEANUP = "cleanup",
}

/**
 * Stream lifecycle events for monitoring and callbacks
 */
export interface StreamLifecycleEvent {
  phase: StreamLifecyclePhase;
  timestamp: Date;
  metadata: Record<string, any>;
  error?: Error;
}

/**
 * Configuration for stream lifecycle management
 */
export interface StreamLifecycleConfig {
  enableHealthChecks: boolean;
  healthCheckIntervalMs: number;
  streamTimeoutMs: number;
  maxRetryAttempts: number;
  backoffStrategy: "linear" | "exponential";
  enableMemoryMonitoring: boolean;
  maxMemoryUsageMB: number;
  enableAbortHandling: boolean;
  gracefulShutdownTimeoutMs: number;
}

/**
 * Default stream lifecycle configuration
 */
export const DEFAULT_STREAM_LIFECYCLE_CONFIG: StreamLifecycleConfig = {
  enableHealthChecks: true,
  healthCheckIntervalMs: 30000, // 30 seconds
  streamTimeoutMs: 300000, // 5 minutes
  maxRetryAttempts: 3,
  backoffStrategy: "exponential",
  enableMemoryMonitoring: true,
  maxMemoryUsageMB: 200,
  enableAbortHandling: true,
  gracefulShutdownTimeoutMs: 10000, // 10 seconds
};

/**
 * Stream lifecycle manager for MCP clients
 * Handles the complete lifecycle of AI SDK streams with MCP tool integration
 */
export class MCPStreamLifecycleManager {
  private phase: StreamLifecyclePhase = StreamLifecyclePhase.INITIALIZING;
  private eventHistory: StreamLifecycleEvent[] = [];
  private config: StreamLifecycleConfig;
  private clients: any[] = [];
  private tools: Record<string, any> = {};
  private closeAllClients: () => Promise<void> = async () => {};
  private errorHandlers: MCPErrorHandlerFactory[] = [];
  private abortController?: AbortController;
  private healthCheckInterval?: NodeJS.Timeout;
  private memoryMonitorInterval?: NodeJS.Timeout;
  private streamStartTime?: Date;

  constructor(
    private clientConfigs: MCPClientConfig[],
    config: Partial<StreamLifecycleConfig> = {},
  ) {
    this.config = { ...DEFAULT_STREAM_LIFECYCLE_CONFIG, ...config };
    this.logEvent(StreamLifecyclePhase.INITIALIZING, {
      clientCount: clientConfigs.length,
    });
  }

  /**
   * Initialize the stream lifecycle with MCP clients
   */
  async initialize(): Promise<{
    tools: Record<string, any>;
    clients: any[];
    streamCallbacks: StreamCallbacks;
  }> {
    try {
      this.streamStartTime = new Date();
      this.logEvent(StreamLifecyclePhase.INITIALIZING, {
        startTime: this.streamStartTime.toISOString(),
      });

      // Create abort controller if enabled
      if (this.config.enableAbortHandling) {
        this.abortController = new AbortController();
      }

      // Import the createMCPToolsFromConfigs function
      const { createMCPToolsFromConfigs } = await import("./client");

      // Initialize MCP clients
      const result = await createMCPToolsFromConfigs(this.clientConfigs, {
        gracefulDegradation: true,
      });

      this.clients = result.clients;
      this.tools = result.tools;
      this.closeAllClients = result.closeAllClients;

      // Create error handlers for each client
      this.errorHandlers = this.clientConfigs.map(
        (config) => new MCPErrorHandlerFactory(config.name, "stream-lifecycle"),
      );

      this.phase = StreamLifecyclePhase.CONNECTED;
      this.logEvent(StreamLifecyclePhase.CONNECTED, {
        clientCount: this.clients.length,
        toolCount: Object.keys(this.tools).length,
      });

      // Start monitoring if enabled
      this.startMonitoring();

      // Create stream callbacks
      const streamCallbacks = this.createStreamCallbacks();

      return {
        tools: this.tools,
        clients: this.clients,
        streamCallbacks,
      };
    } catch (error) {
      this.phase = StreamLifecyclePhase.ERROR;
      const aiError = new AISDKCompatibleMCPError(
        "Failed to initialize MCP stream lifecycle",
        "connection-error",
        error instanceof Error ? error : new Error(String(error)),
        { phase: this.phase },
        true,
      );

      this.logEvent(StreamLifecyclePhase.ERROR, { error: aiError.message });
      throw aiError;
    }
  }

  /**
   * Create AI SDK v5 compatible stream callbacks
   */
  private createStreamCallbacks(): StreamCallbacks {
    return {
      onStart: () => {
        this.phase = StreamLifecyclePhase.STREAMING;
        this.logEvent(StreamLifecyclePhase.STREAMING, {
          elapsedMs: this.getElapsedTime(),
        });

        logInfo("MCP stream started", {
          operation: "mcp_stream_start",
          metadata: {
            clientCount: this.clients.length,
            toolCount: Object.keys(this.tools).length,
            phase: this.phase,
          },
        });
      },

      onProgress: (data: any) => {
        // Monitor memory usage if enabled
        if (this.config.enableMemoryMonitoring) {
          this.checkMemoryUsage();
        }

        if (this.abortController?.signal.aborted) {
          this.handleAbort();
          return;
        }

        this.logEvent(StreamLifecyclePhase.STREAMING, {
          progressData: data,
          elapsedMs: this.getElapsedTime(),
        });
      },

      onFinish: async (event: any) => {
        this.phase = StreamLifecyclePhase.COMPLETING;
        this.logEvent(StreamLifecyclePhase.COMPLETING, {
          finishEvent: event,
          elapsedMs: this.getElapsedTime(),
        });

        try {
          // Perform graceful cleanup
          await this.performGracefulCleanup();

          this.phase = StreamLifecyclePhase.COMPLETED;
          this.logEvent(StreamLifecyclePhase.COMPLETED, {
            totalElapsedMs: this.getElapsedTime(),
            eventCount: this.eventHistory.length,
          });

          logInfo("MCP stream completed successfully", {
            operation: "mcp_stream_complete",
            metadata: {
              totalElapsedMs: this.getElapsedTime(),
              toolCallCount: event?.toolResults?.length || 0,
              usage: event?.usage,
            },
          });
        } catch (error) {
          this.phase = StreamLifecyclePhase.ERROR;
          const aiError = new AISDKCompatibleMCPError(
            "Failed to complete MCP stream lifecycle",
            "resource-exhausted",
            error instanceof Error ? error : new Error(String(error)),
            { phase: this.phase, elapsedMs: this.getElapsedTime() },
            false,
          );

          this.logEvent(StreamLifecyclePhase.ERROR, { error: aiError.message });
          logError("MCP stream completion failed", {
            operation: "mcp_stream_completion_error",
            error: aiError,
            metadata: { phase: this.phase },
          });

          throw aiError;
        }
      },

      onError: async (error: Error) => {
        this.phase = StreamLifecyclePhase.ERROR;
        const aiError = new AISDKCompatibleMCPError(
          "MCP stream error occurred",
          "tool-execution-error",
          error,
          {
            phase: this.phase,
            elapsedMs: this.getElapsedTime(),
            errorLocation: "stream_callback",
          },
          true,
        );

        this.logEvent(StreamLifecyclePhase.ERROR, {
          error: aiError.message,
          errorType: aiError.errorType,
        });

        logError("MCP stream error", {
          operation: "mcp_stream_error",
          error: aiError,
          metadata: {
            phase: this.phase,
            clientCount: this.clients.length,
          },
        });

        // Attempt emergency cleanup
        try {
          await this.performEmergencyCleanup();
        } catch (cleanupError) {
          logError("Emergency cleanup failed after stream error", {
            operation: "mcp_emergency_cleanup_failure",
            error:
              cleanupError instanceof Error
                ? cleanupError
                : new Error(String(cleanupError)),
            metadata: { originalError: aiError.message },
          });
        }
      },

      onUncaughtError: (error: Error) => {
        this.phase = StreamLifecyclePhase.ERROR;
        const aiError = new AISDKCompatibleMCPError(
          "Uncaught error in MCP stream",
          "unknown-error",
          error,
          {
            phase: this.phase,
            elapsedMs: this.getElapsedTime(),
            errorLocation: "uncaught",
          },
          false,
        );

        this.logEvent(StreamLifecyclePhase.ERROR, {
          error: aiError.message,
          errorType: "uncaught",
        });

        logError("Uncaught MCP stream error", {
          operation: "mcp_stream_uncaught_error",
          error: aiError,
          metadata: {
            phase: this.phase,
            stackTrace: error.stack,
          },
        });

        // Delegate to error handlers
        this.errorHandlers.forEach((handler) => {
          const uncaughtHandler = handler.createUncaughtErrorHandler(
            () => this.performEmergencyCleanup(),
            { enableRecovery: false },
          );
          uncaughtHandler(error);
        });
      },

      onAbort: () => {
        this.handleAbort();
      },
    };
  }

  /**
   * Handle stream abortion
   */
  private handleAbort(): void {
    this.phase = StreamLifecyclePhase.ABORTED;
    this.logEvent(StreamLifecyclePhase.ABORTED, {
      elapsedMs: this.getElapsedTime(),
      reason: "user_requested",
    });

    logWarn("MCP stream aborted", {
      operation: "mcp_stream_abort",
      metadata: {
        phase: this.phase,
        elapsedMs: this.getElapsedTime(),
      },
    });

    // Perform abort cleanup
    void this.performAsyncCleanup("mcp_abort_cleanup_failure");
  }

  /**
   * Start monitoring services
   */
  private startMonitoring(): void {
    // Health check monitoring
    if (this.config.enableHealthChecks) {
      this.healthCheckInterval = setInterval(() => {
        this.performHealthCheck();
      }, this.config.healthCheckIntervalMs);
    }

    // Memory monitoring
    if (this.config.enableMemoryMonitoring) {
      this.memoryMonitorInterval = setInterval(() => {
        this.checkMemoryUsage();
      }, 10000); // Check every 10 seconds
    }
  }

  /**
   * Perform health check on MCP clients
   */
  private performHealthCheck(): void {
    const healthStatus = this.clients.length > 0 ? "healthy" : "degraded";

    this.logEvent(this.phase, {
      healthCheck: {
        status: healthStatus,
        clientCount: this.clients.length,
        toolCount: Object.keys(this.tools).length,
        elapsedMs: this.getElapsedTime(),
      },
    });

    if (healthStatus === "degraded") {
      logWarn("MCP stream health degraded", {
        operation: "mcp_stream_health_check",
        metadata: {
          clientCount: this.clients.length,
          phase: this.phase,
        },
      });
    }
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): void {
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

      if (heapUsedMB > this.config.maxMemoryUsageMB) {
        logWarn("MCP stream memory usage high", {
          operation: "mcp_stream_memory_warning",
          metadata: {
            heapUsedMB: Math.round(heapUsedMB),
            maxMemoryUsageMB: this.config.maxMemoryUsageMB,
            phase: this.phase,
          },
        });

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
    }
  }

  /**
   * Perform graceful cleanup
   */
  private async performGracefulCleanup(): Promise<void> {
    this.phase = StreamLifecyclePhase.CLEANUP;
    this.logEvent(StreamLifecyclePhase.CLEANUP, {
      cleanupType: "graceful",
      elapsedMs: this.getElapsedTime(),
    });

    // Stop monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = undefined;
    }

    // Close MCP clients with timeout
    const cleanupPromise = this.closeAllClients();
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Graceful cleanup timeout"));
      }, this.config.gracefulShutdownTimeoutMs);
    });

    try {
      await Promise.race([cleanupPromise, timeoutPromise]);
      logInfo("MCP stream graceful cleanup completed", {
        operation: "mcp_stream_graceful_cleanup",
        metadata: { elapsedMs: this.getElapsedTime() },
      });
    } catch (error) {
      logWarn("Graceful cleanup timeout, performing emergency cleanup", {
        operation: "mcp_graceful_cleanup_timeout",
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      await this.performEmergencyCleanup();
    }
  }

  /**
   * Perform emergency cleanup
   */
  private async performEmergencyCleanup(): Promise<void> {
    this.logEvent(StreamLifecyclePhase.CLEANUP, {
      cleanupType: "emergency",
      elapsedMs: this.getElapsedTime(),
    });

    // Stop all monitoring immediately
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = undefined;
    }

    // Force close clients without waiting
    void this.performAsyncCleanup("mcp_emergency_cleanup_error");

    logWarn("MCP stream emergency cleanup performed", {
      operation: "mcp_stream_emergency_cleanup",
      metadata: { elapsedMs: this.getElapsedTime() },
    });
  }

  /**
   * Log lifecycle event
   */
  private logEvent(
    phase: StreamLifecyclePhase,
    metadata: Record<string, any>,
  ): void {
    const event: StreamLifecycleEvent = {
      phase,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        clientConfigs: this.clientConfigs.map((c) => c.name),
      },
    };

    this.eventHistory.push(event);

    // Keep only last 100 events to prevent memory leaks
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100);
    }
  }

  /**
   * Get elapsed time since stream start
   */
  private getElapsedTime(): number {
    if (!this.streamStartTime) return 0;
    return Date.now() - this.streamStartTime.getTime();
  }

  /**
   * Get current lifecycle status
   */
  getStatus(): {
    phase: StreamLifecyclePhase;
    elapsedMs: number;
    clientCount: number;
    toolCount: number;
    eventCount: number;
    recentEvents: StreamLifecycleEvent[];
  } {
    return {
      phase: this.phase,
      elapsedMs: this.getElapsedTime(),
      clientCount: this.clients.length,
      toolCount: Object.keys(this.tools).length,
      eventCount: this.eventHistory.length,
      recentEvents: this.eventHistory.slice(-10), // Last 10 events
    };
  }

  /**
   * Request abort
   */
  requestAbort(): void {
    if (this.abortController && !this.abortController.signal.aborted) {
      this.abortController.abort();
    }
  }

  /**
   * Perform async cleanup with proper error handling
   */
  private async performAsyncCleanup(operationType: string): Promise<void> {
    try {
      await this.closeAllClients();
    } catch (error) {
      logError("Cleanup failed", {
        operation: operationType,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }
}

/**
 * Stream callback interface for AI SDK v5 integration
 */
export interface StreamCallbacks {
  onStart: () => void;
  onProgress: (data: any) => void;
  onFinish: (event: any) => Promise<void>;
  onError: (error: Error) => Promise<void>;
  onUncaughtError: (error: Error) => void;
  onAbort: () => void;
}

/**
 * Factory function to create MCP stream lifecycle manager
 */
export function createMCPStreamLifecycleManager(
  clientConfigs: MCPClientConfig[],
  config?: Partial<StreamLifecycleConfig>,
): MCPStreamLifecycleManager {
  return new MCPStreamLifecycleManager(clientConfigs, config);
}
