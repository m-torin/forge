/**
 * Experimental Stream Data Implementation
 * Stream arbitrary data alongside AI responses
 */

import { logError, logInfo } from '@repo/observability/server/next';
// StreamData may not be available in this version, using a compatible implementation
class StreamDataImpl {
  close() {}
  append(value: any) {}
}

const StreamData = StreamDataImpl;

/**
 * Enhanced StreamData with additional features
 */
export class EnhancedStreamData extends StreamData {
  private metadata: Map<string, any> = new Map();
  private messageCount = 0;
  private startTime = Date.now();
  private dataBuffer: Array<{ type: string; data: any; timestamp: number }> = [];

  constructor() {
    super();

    logInfo('Enhanced StreamData: Created', {
      operation: 'stream_data_create',
      metadata: { startTime: this.startTime },
    });
  }

  /**
   * Append data with type information
   */
  appendTyped<T>(type: string, data: T): void {
    this.append({ type, data, timestamp: Date.now() });
    this.dataBuffer.push({ type, data, timestamp: Date.now() });
    this.messageCount++;

    logInfo('Enhanced StreamData: Appended typed data', {
      operation: 'stream_data_append_typed',
      metadata: { type, messageCount: this.messageCount },
    });
  }

  /**
   * Append metadata
   */
  appendMetadata(key: string, value: any): void {
    this.metadata.set(key, value);
    this.append({ metadata: { [key]: value } });

    logInfo('Enhanced StreamData: Appended metadata', {
      operation: 'stream_data_append_metadata',
      metadata: { key },
    });
  }

  /**
   * Append progress update
   */
  appendProgress(current: number, total: number, message?: string): void {
    const progress = {
      current,
      total,
      percentage: Math.round((current / total) * 100),
      message,
      timestamp: Date.now(),
    };

    this.appendTyped('progress', progress);
  }

  /**
   * Append analytics event
   */
  appendAnalytics(event: string, properties?: Record<string, any>): void {
    this.appendTyped('analytics', {
      event,
      properties,
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
    });
  }

  /**
   * Append error with context
   */
  appendError(error: Error | string, context?: Record<string, any>): void {
    const errorData = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: Date.now(),
    };

    this.appendTyped('error', errorData);

    logError('Enhanced StreamData: Error appended', {
      operation: 'stream_data_append_error',
      error: error instanceof Error ? error : new Error(String(error)),
      metadata: context,
    });
  }

  /**
   * Get stream statistics
   */
  getStatistics(): {
    messageCount: number;
    duration: number;
    metadata: Record<string, any>;
    dataTypes: Record<string, number>;
  } {
    const dataTypes: Record<string, number> = {};

    this.dataBuffer.forEach(({ type }) => {
      dataTypes[type] = (dataTypes[type] || 0) + 1;
    });

    return {
      messageCount: this.messageCount,
      duration: Date.now() - this.startTime,
      metadata: Object.fromEntries(this.metadata),
      dataTypes,
    };
  }

  /**
   * Create a checkpoint
   */
  createCheckpoint(name: string): void {
    this.appendTyped('checkpoint', {
      name,
      messageCount: this.messageCount,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime,
    });
  }

  /**
   * Close with summary
   */
  closeWithSummary(): void {
    const stats = this.getStatistics();
    this.appendTyped('summary', stats);
    this.close();

    logInfo('Enhanced StreamData: Closed with summary', {
      operation: 'stream_data_close',
      metadata: stats,
    });
  }
}

/**
 * Stream data patterns
 */
export const streamDataPatterns = {
  /**
   * Create a progress tracking stream
   */
  createProgressStream: (totalSteps: number) => {
    const streamData = new EnhancedStreamData();
    let currentStep = 0;

    return {
      streamData,
      nextStep: (message?: string) => {
        currentStep++;
        streamData.appendProgress(currentStep, totalSteps, message);
      },
      complete: () => {
        streamData.appendProgress(totalSteps, totalSteps, 'Complete');
        streamData.closeWithSummary();
      },
      error: (error: Error) => {
        streamData.appendError(error, { step: currentStep });
        streamData.close();
      },
    };
  },

  /**
   * Create a multi-phase stream
   */
  createMultiPhaseStream: (phases: string[]) => {
    const streamData = new EnhancedStreamData();
    let currentPhaseIndex = 0;

    return {
      streamData,
      startPhase: (metadata?: Record<string, any>) => {
        if (currentPhaseIndex < phases.length) {
          const phase = phases[currentPhaseIndex];
          streamData.appendTyped('phase_start', {
            phase,
            index: currentPhaseIndex,
            total: phases.length,
            metadata,
          });
        }
      },
      completePhase: (results?: any) => {
        if (currentPhaseIndex < phases.length) {
          const phase = phases[currentPhaseIndex];
          streamData.appendTyped('phase_complete', {
            phase,
            index: currentPhaseIndex,
            results,
          });
          currentPhaseIndex++;
        }
      },
      isComplete: () => currentPhaseIndex >= phases.length,
      finish: () => streamData.closeWithSummary(),
    };
  },

  /**
   * Create a metrics stream
   */
  createMetricsStream: (interval = 1000) => {
    const streamData = new EnhancedStreamData();
    const metrics: Record<string, number[]> = {};

    const intervalId = setInterval(() => {
      const snapshot: Record<string, any> = {};

      for (const [key, values] of Object.entries(metrics)) {
        if (values.length > 0) {
          snapshot[key] = {
            current: values[values.length - 1],
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
          };
        }
      }

      if (Object.keys(snapshot).length > 0) {
        streamData.appendTyped('metrics', snapshot);
      }
    }, interval);

    return {
      streamData,
      recordMetric: (name: string, value: number) => {
        if (!metrics[name]) {
          metrics[name] = [];
        }
        metrics[name].push(value);
      },
      stop: () => {
        clearInterval(intervalId);
        streamData.closeWithSummary();
      },
    };
  },
};

/**
 * Create streaming response with data
 */
export function createStreamingResponseWithData(
  stream: ReadableStream,
  streamData?: EnhancedStreamData,
  options?: {
    headers?: HeadersInit;
    status?: number;
    statusText?: string;
  },
): Response {
  const response = new Response(stream, {
    ...options,
    headers: {
      ...options?.headers,
      'X-Stream-Data': 'true',
    },
  });

  return response;
}

/**
 * Stream data utilities
 */
export const streamDataUtils = {
  /**
   * Create a buffered stream data
   */
  createBufferedStreamData: (bufferSize = 10, flushInterval = 100) => {
    const streamData = new EnhancedStreamData();
    const buffer: any[] = [];

    const flush = () => {
      if (buffer.length > 0) {
        streamData.append(buffer);
        buffer.length = 0;
      }
    };

    const intervalId = setInterval(flush, flushInterval);

    return {
      append: (data: any) => {
        buffer.push(data);
        if (buffer.length >= bufferSize) {
          flush();
        }
      },
      flush,
      close: () => {
        flush();
        clearInterval(intervalId);
        streamData.close();
      },
      streamData,
    };
  },

  /**
   * Create a filtered stream data
   */
  createFilteredStreamData: (filter: (data: any) => boolean, transform?: (data: any) => any) => {
    const streamData = new EnhancedStreamData();

    return {
      append: (data: any) => {
        if (filter(data)) {
          const transformed = transform ? transform(data) : data;
          streamData.append(transformed);
        }
      },
      close: () => streamData.close(),
      streamData,
    };
  },

  /**
   * Create a rate-limited stream data
   */
  createRateLimitedStreamData: (messagesPerSecond: number) => {
    const streamData = new EnhancedStreamData();
    const queue: any[] = [];
    const interval = 1000 / messagesPerSecond;
    let lastSent = 0;

    const processQueue = () => {
      const now = Date.now();
      if (queue.length > 0 && now - lastSent >= interval) {
        streamData.append(queue.shift());
        lastSent = now;
      }

      if (queue.length > 0) {
        setTimeout(processQueue, interval);
      }
    };

    return {
      append: (data: any) => {
        queue.push(data);
        processQueue();
      },
      close: () => {
        // Flush remaining queue
        queue.forEach(data => streamData.append(data));
        streamData.close();
      },
      streamData,
    };
  },
};
