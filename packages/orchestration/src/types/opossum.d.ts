declare module 'opossum' {
  interface CircuitBreakerOptions {
    capacity?: number;
    errorFilter?: (error: Error) => boolean;
    errorThresholdPercentage?: number;
    group?: string;
    name?: string;
    resetTimeout?: number;
    rollingCountBuckets?: number;
    rollingCountTimeout?: number;
    timeout?: number;
    volumeThreshold?: number;
  }

  interface CircuitBreakerStats {
    cacheHits: number;
    cacheMisses: number;
    callsExecuted: number;
    callsFailed: number;
    callsPending: number;
    callsRejected: number;
    callsSubmitted: number;
    callsSucceeded: number;
    callsTimedOut: number;
    fallbacks: number;
    fires: number;
    percentileLatencies: Record<string, number>;
    semaphoreRejections: number;
  }

  export default class CircuitBreaker<T extends unknown[], R> {
    get closed(): boolean;

    get halfOpen(): boolean;

    get opened(): boolean;
    get options(): CircuitBreakerOptions;
    get stats(): CircuitBreakerStats;
    constructor(fn: (...args: T) => Promise<R>, options?: CircuitBreakerOptions);
    close(): void;

    destroy(): void;
    fire(...args: T): Promise<R>;
    on(event: 'close' | 'halfOpen' | 'open', listener: () => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
    open(): void;
  }
}
