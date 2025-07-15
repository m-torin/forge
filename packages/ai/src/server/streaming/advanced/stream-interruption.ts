/**
 * Stream Interruption and Control
 * Handle stream interruption, resumption, and graceful shutdown
 */

import { logInfo, logWarn } from '@repo/observability/server/next';

/**
 * Stream controller for interruption handling
 */
export class StreamInterruptionController {
  private abortController: AbortController;
  private pauseState = false;
  private resumeCallbacks: Array<() => void> = [];
  private interruptHandlers: Array<(reason: string) => void | Promise<void>> = [];
  private checkpoints: Map<string, any> = new Map();
  private state: 'active' | 'paused' | 'interrupted' | 'completed' = 'active';

  constructor() {
    this.abortController = new AbortController();
  }

  /**
   * Get abort signal for fetch/stream operations
   */
  get signal(): AbortSignal {
    return this.abortController.signal;
  }

  /**
   * Check if stream is paused
   */
  get isPaused(): boolean {
    return this.pauseState;
  }

  /**
   * Get current state
   */
  get currentState(): string {
    return this.state;
  }

  /**
   * Pause the stream
   */
  pause(): void {
    if (this.state !== 'active') {
      logWarn('Stream Controller: Cannot pause non-active stream', {
        operation: 'stream_pause_failed',
        metadata: { currentState: this.state },
      });
      return;
    }

    this.pauseState = true;
    this.state = 'paused';

    logInfo('Stream Controller: Paused', {
      operation: 'stream_paused',
    });
  }

  /**
   * Resume the stream
   */
  resume(): void {
    if (this.state !== 'paused') {
      logWarn('Stream Controller: Cannot resume non-paused stream', {
        operation: 'stream_resume_failed',
        metadata: { currentState: this.state },
      });
      return;
    }

    this.pauseState = false;
    this.state = 'active';

    // Execute resume callbacks
    this.resumeCallbacks.forEach(callback => callback());
    this.resumeCallbacks = [];

    logInfo('Stream Controller: Resumed', {
      operation: 'stream_resumed',
    });
  }

  /**
   * Interrupt the stream
   */
  async interrupt(reason: string): Promise<void> {
    if (this.state === 'completed' || this.state === 'interrupted') {
      return;
    }

    this.state = 'interrupted';

    // Execute interrupt handlers
    await Promise.all(this.interruptHandlers.map(handler => handler(reason)));

    // Abort the stream
    this.abortController.abort(reason);

    logInfo('Stream Controller: Interrupted', {
      operation: 'stream_interrupted',
      metadata: { reason },
    });
  }

  /**
   * Complete the stream
   */
  complete(): void {
    this.state = 'completed';

    logInfo('Stream Controller: Completed', {
      operation: 'stream_completed',
    });
  }

  /**
   * Wait for pause to be lifted
   */
  async waitForResume(): Promise<void> {
    if (!this.pauseState) {
      return;
    }

    return new Promise<void>(resolve => {
      this.resumeCallbacks.push(resolve);
    });
  }

  /**
   * Add interrupt handler
   */
  onInterrupt(handler: (reason: string) => void | Promise<void>): void {
    this.interruptHandlers.push(handler);
  }

  /**
   * Save checkpoint
   */
  saveCheckpoint(id: string, data: any): void {
    this.checkpoints.set(id, {
      data,
      timestamp: Date.now(),
    });

    logInfo('Stream Controller: Checkpoint saved', {
      operation: 'stream_checkpoint_save',
      metadata: { checkpointId: id },
    });
  }

  /**
   * Get checkpoint
   */
  getCheckpoint(id: string): any {
    const checkpoint = this.checkpoints.get(id);
    return checkpoint?.data;
  }

  /**
   * Get all checkpoints
   */
  getAllCheckpoints(): Record<string, any> {
    const result: Record<string, any> = {};
    this.checkpoints.forEach((value, key) => {
      result[key] = value.data;
    });
    return result;
  }
}

/**
 * Interruptible stream wrapper
 */
export function createInterruptibleStream<T>(
  sourceStream: ReadableStream<T>,
  controller: StreamInterruptionController,
): ReadableStream<T> {
  return new ReadableStream<T>({
    async start(streamController) {
      const reader = sourceStream.getReader();

      // Handle abort signal
      controller.signal.addEventListener('abort', () => {
        reader.cancel(controller.signal.reason);
        streamController.close();
      });

      try {
        while (true) {
          // Check for pause
          await controller.waitForResume();

          // Check if aborted
          if (controller.signal.aborted) {
            break;
          }

          const { done, value } = await reader.read();

          if (done) {
            controller.complete();
            streamController.close();
            break;
          }

          streamController.enqueue(value);
        }
      } catch (error) {
        streamController.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

/**
 * Resumable stream manager
 */
export class ResumableStreamManager {
  private streams: Map<
    string,
    {
      controller: StreamInterruptionController;
      checkpoint: any;
      metadata: Record<string, any>;
    }
  > = new Map();

  /**
   * Register a stream
   */
  registerStream(
    id: string,
    controller: StreamInterruptionController,
    metadata?: Record<string, any>,
  ): void {
    this.streams.set(id, {
      controller,
      checkpoint: null,
      metadata: metadata || {},
    });
  }

  /**
   * Get stream controller
   */
  getController(id: string): StreamInterruptionController | undefined {
    return this.streams.get(id)?.controller;
  }

  /**
   * Pause stream
   */
  pauseStream(id: string): boolean {
    const stream = this.streams.get(id);
    if (stream) {
      stream.controller.pause();
      return true;
    }
    return false;
  }

  /**
   * Resume stream
   */
  resumeStream(id: string): boolean {
    const stream = this.streams.get(id);
    if (stream) {
      stream.controller.resume();
      return true;
    }
    return false;
  }

  /**
   * Interrupt stream
   */
  async interruptStream(id: string, reason: string): Promise<boolean> {
    const stream = this.streams.get(id);
    if (stream) {
      await stream.controller.interrupt(reason);
      return true;
    }
    return false;
  }

  /**
   * Save stream state
   */
  saveStreamState(id: string, checkpoint: any): void {
    const stream = this.streams.get(id);
    if (stream) {
      stream.checkpoint = checkpoint;
      stream.controller.saveCheckpoint('latest', checkpoint);
    }
  }

  /**
   * Get stream state
   */
  getStreamState(id: string): any {
    return this.streams.get(id)?.checkpoint;
  }

  /**
   * Remove stream
   */
  removeStream(id: string): void {
    this.streams.delete(id);
  }

  /**
   * Get all active streams
   */
  getActiveStreams(): Array<{ id: string; state: string; metadata: Record<string, any> }> {
    const active: Array<{ id: string; state: string; metadata: Record<string, any> }> = [];

    this.streams.forEach((stream, id) => {
      active.push({
        id,
        state: stream.controller.currentState,
        metadata: stream.metadata,
      });
    });

    return active;
  }
}

/**
 * Global resumable stream manager
 */
export const globalStreamManager = new ResumableStreamManager();

/**
 * Stream interruption patterns
 */
export const interruptionPatterns = {
  /**
   * Create a timeout-based interruption
   */
  createTimeoutInterruption: (
    controller: StreamInterruptionController,
    timeoutMs: number,
  ): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      controller.interrupt('Timeout exceeded');
    }, timeoutMs);

    // Clear timeout if stream completes
    controller.onInterrupt(() => {
      clearTimeout(timeout);
    });

    return timeout;
  },

  /**
   * Create a token-limit interruption
   */
  createTokenLimitInterruption: (controller: StreamInterruptionController, maxTokens: number) => {
    let tokenCount = 0;

    return {
      checkTokens: (tokens: number) => {
        tokenCount += tokens;
        if (tokenCount >= maxTokens) {
          controller.interrupt('Token limit exceeded');
        }
      },
      getCurrentTokens: () => tokenCount,
    };
  },

  /**
   * Create a user-triggered interruption
   */
  createUserInterruption: (controller: StreamInterruptionController) => {
    return {
      interrupt: () => controller.interrupt('User requested interruption'),
      pause: () => controller.pause(),
      resume: () => controller.resume(),
      getState: () => controller.currentState,
    };
  },
};

/**
 * Create a graceful shutdown handler
 */
export function createGracefulShutdown(
  streams: StreamInterruptionController[],
): () => Promise<void> {
  return async () => {
    logInfo('Graceful Shutdown: Initiated', {
      operation: 'graceful_shutdown_start',
      metadata: { streamCount: streams.length },
    });

    // Interrupt all streams
    await Promise.all(streams.map(controller => controller.interrupt('System shutdown')));

    logInfo('Graceful Shutdown: Completed', {
      operation: 'graceful_shutdown_complete',
    });
  };
}
