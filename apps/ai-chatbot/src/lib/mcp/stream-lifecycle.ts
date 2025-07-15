/**
 * MCP Stream Lifecycle Management
 * Provides comprehensive stream lifecycle management with feature flag integration
 * and enhanced error recovery for AI SDK v5 streams
 */

import { logError, logInfo, logWarn } from '@repo/observability';
import type { FeatureFlagContext } from '../feature-flags/config';
import { isMcpFeatureEnabled } from '../feature-flags/config';
import { mcpSecurity } from './security';

/**
 * Stream lifecycle event types
 */
export type StreamLifecycleEvent =
  | 'stream_started'
  | 'stream_chunk_received'
  | 'stream_tool_call'
  | 'stream_error'
  | 'stream_recovered'
  | 'stream_finished'
  | 'stream_aborted';

/**
 * Stream lifecycle context
 */
export interface StreamLifecycleContext {
  streamId: string;
  chatId: string;
  userId: string;
  modelId: string;
  mcpClientType: 'mock' | 'enhanced' | 'demo';
  mcpEnhanced: boolean;
  capabilities: string[];
  startTime: Date;
  metadata?: Record<string, any>;
}

/**
 * Stream lifecycle metrics
 */
export interface StreamLifecycleMetrics {
  duration: number;
  chunksReceived: number;
  toolCallsCount: number;
  errorsCount: number;
  recoveryCount: number;
  finalStatus: 'completed' | 'error' | 'aborted';
  mcpToolsUsed: string[];
  bytesProcessed: number;
}

/**
 * Stream lifecycle event handler
 */
export interface StreamLifecycleEventHandler {
  onEvent: (
    event: StreamLifecycleEvent,
    context: StreamLifecycleContext,
    data?: any,
  ) => void | Promise<void>;
}

/**
 * MCP-aware stream lifecycle manager
 * Manages the complete lifecycle of AI SDK v5 streams with MCP integration
 */
export class McpStreamLifecycleManager {
  private static instance: McpStreamLifecycleManager;
  private activeStreams = new Map<string, StreamLifecycleContext>();
  private streamMetrics = new Map<string, StreamLifecycleMetrics>();
  private eventHandlers: StreamLifecycleEventHandler[] = [];

  private constructor() {}

  public static getInstance(): McpStreamLifecycleManager {
    if (!McpStreamLifecycleManager.instance) {
      McpStreamLifecycleManager.instance = new McpStreamLifecycleManager();
    }
    return McpStreamLifecycleManager.instance;
  }

  /**
   * Start tracking a new stream
   */
  public startStream(context: StreamLifecycleContext): void {
    this.activeStreams.set(context.streamId, context);
    this.streamMetrics.set(context.streamId, {
      duration: 0,
      chunksReceived: 0,
      toolCallsCount: 0,
      errorsCount: 0,
      recoveryCount: 0,
      finalStatus: 'completed',
      mcpToolsUsed: [],
      bytesProcessed: 0,
    });

    this.emitEvent('stream_started', context);

    logInfo('MCP Stream lifecycle started', {
      operation: 'mcp_stream_lifecycle_start',
      metadata: {
        streamId: context.streamId,
        chatId: context.chatId,
        userId: context.userId,
        modelId: context.modelId,
        mcpClientType: context.mcpClientType,
        mcpEnhanced: context.mcpEnhanced,
        capabilities: context.capabilities,
      },
    });
  }

  /**
   * Record a stream chunk
   */
  public recordChunk(streamId: string, chunkData: any): void {
    const metrics = this.streamMetrics.get(streamId);
    if (!metrics) return;

    metrics.chunksReceived++;
    if (chunkData && typeof chunkData === 'string') {
      metrics.bytesProcessed += new TextEncoder().encode(chunkData).length;
    }

    const context = this.activeStreams.get(streamId);
    if (context) {
      this.emitEvent('stream_chunk_received', context, {
        chunkIndex: metrics.chunksReceived,
        chunkSize: chunkData ? new TextEncoder().encode(String(chunkData)).length : 0,
      });
    }
  }

  /**
   * Record a tool call
   */
  public recordToolCall(streamId: string, toolName: string, toolResult?: any): void {
    const metrics = this.streamMetrics.get(streamId);
    const context = this.activeStreams.get(streamId);

    if (!metrics || !context) return;

    metrics.toolCallsCount++;

    // Track MCP-specific tool usage
    const mcpTools = context.metadata?.mcpTools || {};
    if (Object.keys(mcpTools).includes(toolName)) {
      if (!metrics.mcpToolsUsed.includes(toolName)) {
        metrics.mcpToolsUsed.push(toolName);
      }

      logInfo('MCP Tool called during stream', {
        operation: 'mcp_stream_tool_call',
        metadata: {
          streamId,
          chatId: context.chatId,
          userId: context.userId,
          toolName,
          mcpClientType: context.mcpClientType,
          mcpEnhanced: context.mcpEnhanced,
          totalToolCalls: metrics.toolCallsCount,
          mcpToolsUsed: metrics.mcpToolsUsed,
        },
      });
    }

    this.emitEvent('stream_tool_call', context, {
      toolName,
      toolResult,
      isMcpTool: Object.keys(mcpTools).includes(toolName),
    });
  }

  /**
   * Record a stream error
   */
  public recordError(streamId: string, error: Error): void {
    const metrics = this.streamMetrics.get(streamId);
    const context = this.activeStreams.get(streamId);

    if (!metrics || !context) return;

    metrics.errorsCount++;
    metrics.finalStatus = 'error';

    logError('MCP Stream lifecycle error', {
      operation: 'mcp_stream_lifecycle_error',
      metadata: {
        streamId,
        chatId: context.chatId,
        userId: context.userId,
        modelId: context.modelId,
        mcpClientType: context.mcpClientType,
        errorCount: metrics.errorsCount,
        error: error.message,
      },
      error,
    });

    this.emitEvent('stream_error', context, { error });
  }

  /**
   * Record a stream recovery
   */
  public recordRecovery(streamId: string, recoveryStrategy: string): void {
    const metrics = this.streamMetrics.get(streamId);
    const context = this.activeStreams.get(streamId);

    if (!metrics || !context) return;

    metrics.recoveryCount++;

    logInfo('MCP Stream recovered from error', {
      operation: 'mcp_stream_recovery',
      metadata: {
        streamId,
        chatId: context.chatId,
        userId: context.userId,
        recoveryStrategy,
        mcpClientType: context.mcpClientType,
        recoveryCount: metrics.recoveryCount,
      },
    });

    this.emitEvent('stream_recovered', context, { recoveryStrategy });
  }

  /**
   * Finish tracking a stream
   */
  public finishStream(
    streamId: string,
    finalStatus: 'completed' | 'error' | 'aborted' = 'completed',
  ): void {
    const context = this.activeStreams.get(streamId);
    const metrics = this.streamMetrics.get(streamId);

    if (!context || !metrics) return;

    metrics.duration = Date.now() - context.startTime.getTime();
    metrics.finalStatus = finalStatus;

    logInfo('MCP Stream lifecycle finished', {
      operation: 'mcp_stream_lifecycle_finish',
      metadata: {
        streamId,
        chatId: context.chatId,
        userId: context.userId,
        modelId: context.modelId,
        mcpClientType: context.mcpClientType,
        mcpEnhanced: context.mcpEnhanced,
        finalStatus,
        duration: metrics.duration,
        chunksReceived: metrics.chunksReceived,
        toolCallsCount: metrics.toolCallsCount,
        mcpToolsUsed: metrics.mcpToolsUsed,
        errorsCount: metrics.errorsCount,
        recoveryCount: metrics.recoveryCount,
        bytesProcessed: metrics.bytesProcessed,
      },
    });

    this.emitEvent('stream_finished', context, { metrics });

    // Clean up after a delay to allow for analytics collection
    setTimeout(() => {
      this.activeStreams.delete(streamId);
      this.streamMetrics.delete(streamId);
    }, 60000); // 1 minute cleanup delay
  }

  /**
   * Abort a stream
   */
  public abortStream(streamId: string, reason?: string): void {
    const context = this.activeStreams.get(streamId);

    if (!context) return;

    logWarn('MCP Stream aborted', {
      operation: 'mcp_stream_abort',
      metadata: {
        streamId,
        chatId: context.chatId,
        userId: context.userId,
        reason: reason || 'No reason provided',
        mcpClientType: context.mcpClientType,
      },
    });

    this.emitEvent('stream_aborted', context, { reason });
    this.finishStream(streamId, 'aborted');
  }

  /**
   * Add an event handler
   */
  public addEventHandler(handler: StreamLifecycleEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove an event handler
   */
  public removeEventHandler(handler: StreamLifecycleEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index >= 0) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Get active streams count
   */
  public getActiveStreamsCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Get stream metrics
   */
  public getStreamMetrics(streamId: string): StreamLifecycleMetrics | undefined {
    return this.streamMetrics.get(streamId);
  }

  /**
   * Get all active stream contexts
   */
  public getActiveStreams(): StreamLifecycleContext[] {
    return Array.from(this.activeStreams.values());
  }

  /**
   * Emit an event to all handlers
   */
  private emitEvent(
    event: StreamLifecycleEvent,
    context: StreamLifecycleContext,
    data?: any,
  ): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler.onEvent(event, context, data);
      } catch (error) {
        logError('Stream lifecycle event handler error', {
          operation: 'stream_lifecycle_handler_error',
          metadata: {
            event,
            streamId: context.streamId,
            handlerError: error instanceof Error ? error.message : String(error),
          },
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });
  }
}

/**
 * Create MCP-aware stream lifecycle wrapper
 * Wraps AI SDK v5 stream operations with comprehensive lifecycle management
 */
export function createMcpStreamLifecycleWrapper(
  context: FeatureFlagContext,
  streamContext: {
    streamId: string;
    chatId: string;
    userId: string;
    modelId: string;
    mcpClientType: 'mock' | 'enhanced' | 'demo';
    mcpEnhanced: boolean;
    capabilities: string[];
    mcpTools?: Record<string, any>;
  },
) {
  const lifecycleManager = McpStreamLifecycleManager.getInstance();
  const isLifecycleEnabled = isMcpFeatureEnabled('mcpStreamLifecycleEnabled', context);

  if (!isLifecycleEnabled) {
    // Return minimal wrapper if lifecycle management is disabled
    return {
      startStream: () => {},
      recordChunk: () => {},
      recordToolCall: () => {},
      recordError: () => {},
      recordRecovery: () => {},
      finishStream: () => {},
      abortStream: () => {},
    };
  }

  const lifecycleContext: StreamLifecycleContext = {
    streamId: streamContext.streamId,
    chatId: streamContext.chatId,
    userId: streamContext.userId,
    modelId: streamContext.modelId,
    mcpClientType: streamContext.mcpClientType,
    mcpEnhanced: streamContext.mcpEnhanced,
    capabilities: streamContext.capabilities,
    startTime: new Date(),
    metadata: {
      mcpTools: streamContext.mcpTools || {},
    },
  };

  return {
    startStream: () => {
      if (mcpSecurity.hasPermission(streamContext.userId, 'stream', 'lifecycle_management')) {
        lifecycleManager.startStream(lifecycleContext);
      }
    },

    recordChunk: (chunkData: any) => {
      lifecycleManager.recordChunk(streamContext.streamId, chunkData);
    },

    recordToolCall: (toolName: string, toolResult?: any) => {
      lifecycleManager.recordToolCall(streamContext.streamId, toolName, toolResult);
    },

    recordError: (error: Error) => {
      lifecycleManager.recordError(streamContext.streamId, error);
    },

    recordRecovery: (recoveryStrategy: string) => {
      lifecycleManager.recordRecovery(streamContext.streamId, recoveryStrategy);
    },

    finishStream: (finalStatus: 'completed' | 'error' | 'aborted' = 'completed') => {
      lifecycleManager.finishStream(streamContext.streamId, finalStatus);
    },

    abortStream: (reason?: string) => {
      lifecycleManager.abortStream(streamContext.streamId, reason);
    },

    getMetrics: () => {
      return lifecycleManager.getStreamMetrics(streamContext.streamId);
    },
  };
}

/**
 * Global stream lifecycle analytics
 */
export class McpStreamAnalytics {
  private static instance: McpStreamAnalytics;
  private lifecycleManager: McpStreamLifecycleManager;

  private constructor() {
    this.lifecycleManager = McpStreamLifecycleManager.getInstance();
  }

  public static getInstance(): McpStreamAnalytics {
    if (!McpStreamAnalytics.instance) {
      McpStreamAnalytics.instance = new McpStreamAnalytics();
    }
    return McpStreamAnalytics.instance;
  }

  /**
   * Get comprehensive analytics
   */
  public getAnalytics(): {
    activeStreams: number;
    totalStreamsToday: number;
    averageStreamDuration: number;
    mcpToolUsageStats: Record<string, number>;
    errorRate: number;
    recoveryRate: number;
  } {
    // This would be implemented with persistent storage in production
    return {
      activeStreams: this.lifecycleManager.getActiveStreamsCount(),
      totalStreamsToday: 0, // Would query from persistent storage
      averageStreamDuration: 0, // Would calculate from historical data
      mcpToolUsageStats: {}, // Would aggregate from historical data
      errorRate: 0, // Would calculate from historical data
      recoveryRate: 0, // Would calculate from historical data
    };
  }
}

/**
 * Export singleton instances for easy access
 */
export const mcpStreamLifecycle = McpStreamLifecycleManager.getInstance();
export const mcpStreamAnalytics = McpStreamAnalytics.getInstance();

/**
 * Utility functions for stream lifecycle management
 */
export const streamLifecycleUtils = {
  createWrapper: createMcpStreamLifecycleWrapper,
  getManager: () => McpStreamLifecycleManager.getInstance(),
  getAnalytics: () => McpStreamAnalytics.getInstance(),
};
