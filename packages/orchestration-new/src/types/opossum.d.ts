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

  export default class CircuitBreaker<T extends any[], R> {
    constructor(fn: (...args: T) => Promise<R>, options?: CircuitBreakerOptions);
    
    fire(...args: T): Promise<R>;
    
    get stats(): CircuitBreakerStats;
    get options(): CircuitBreakerOptions;
    get closed(): boolean;
    get opened(): boolean;
    get halfOpen(): boolean;
    
    close(): void;
    open(): void;
    destroy(): void;
    
    on(event: 'open' | 'close' | 'halfOpen', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;
  }

}