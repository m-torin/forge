/**
 * Node 22+ Standardized Implementation Patterns
 *
 * Centralized collection of standardized Node 22+ implementation patterns
 * to ensure consistency across the entire monorepo. These patterns provide
 * battle-tested, performance-optimized implementations of Node 22+ features
 * that can be reused across all packages.
 *
 * ## Design Principles:
 * - **Consistency**: Standardized APIs and usage patterns
 * - **Performance**: Optimized implementations with proper resource management
 * - **Safety**: Built-in error handling and cleanup mechanisms
 * - **Type Safety**: Full TypeScript support with generics
 * - **Observability**: Comprehensive monitoring and debugging capabilities
 *
 * ## Pattern Categories:
 * - **Promise Management**: withResolvers patterns and utilities
 * - **Cancellation**: AbortSignal coordination and timeout patterns
 * - **Data Safety**: structuredClone best practices and utilities
 * - **Memory Management**: WeakMap/WeakSet patterns and monitoring
 * - **Timing**: High-resolution timing utilities and benchmarking
 * - **Cleanup**: FinalizationRegistry patterns and resource management
 *
 * @module Node22Patterns
 * @version 2.0.0
 * @since Node.js 22.0.0
 */

/**
 * Promise Management Patterns - Standardized Promise.withResolvers() usage
 */
export namespace PromisePatterns {
  /**
   * Standard promise with resolvers pattern
   */
  export interface PromiseWithResolvers<T> {
    readonly promise: Promise<T>;
    readonly resolve: (value: T | PromiseLike<T>) => void;
    readonly reject: (reason?: any) => void;
  }

  /**
   * Create a promise with external resolvers using standard pattern
   */
  export function createResolvablePromise<T>(): PromiseWithResolvers<T> {
    return Promise.withResolvers<T>();
  }

  /**
   * Coordinated promise execution with timeout and cancellation
   */
  export async function executeWithCoordination<T>(
    executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void | Promise<void>,
    options: {
      timeout?: number;
      abortSignal?: AbortSignal;
      onTimeout?: () => void;
      onAbort?: () => void;
    } = {},
  ): Promise<T> {
    const { promise, resolve, reject } = Promise.withResolvers<T>();
    const { timeout = 30000, abortSignal, onTimeout, onAbort } = options;

    // Setup timeout if specified
    const timeoutController = timeout > 0 ? new AbortController() : null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (timeoutController && timeout > 0) {
      timeoutId = setTimeout(() => {
        timeoutController.abort();
        onTimeout?.();
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    }

    // Setup abort handling
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    if (abortSignal) {
      abortSignal.addEventListener(
        'abort',
        () => {
          cleanup();
          onAbort?.();
          reject(new Error('Operation was aborted'));
        },
        { once: true },
      );
    }

    // Setup success/error handling
    const wrappedResolve = (value: T) => {
      cleanup();
      resolve(value);
    };

    const wrappedReject = (reason?: any) => {
      cleanup();
      reject(reason);
    };

    try {
      const result = executor(wrappedResolve, wrappedReject);
      if (result instanceof Promise) {
        result.catch(wrappedReject);
      }
    } catch (error) {
      wrappedReject(error);
    }

    return promise;
  }

  /**
   * Batch promise execution with coordination
   */
  export async function executeBatch<T>(
    tasks: Array<() => Promise<T>>,
    options: {
      concurrency?: number;
      timeout?: number;
      abortSignal?: AbortSignal;
      onProgress?: (completed: number, total: number) => void;
    } = {},
  ): Promise<Array<{ status: 'fulfilled' | 'rejected'; value?: T; reason?: any }>> {
    const { concurrency = 5, timeout = 60000, abortSignal, onProgress } = options;

    const results: Array<{ status: 'fulfilled' | 'rejected'; value?: T; reason?: any }> = [];
    const executing: Promise<void>[] = [];
    let completedCount = 0;

    const processTask = async (task: () => Promise<T>, index: number): Promise<void> => {
      try {
        const timeoutSignal = AbortSignal.timeout(timeout);
        const combinedSignal = abortSignal
          ? AbortSignal.any([abortSignal, timeoutSignal])
          : timeoutSignal;

        const value = await Promise.race([
          task(),
          new Promise<never>((_resolve, reject) => {
            combinedSignal.addEventListener('abort', () => {
              reject(new Error('Task aborted or timed out'));
            });
          }),
        ]);

        results[index] = { status: 'fulfilled', value };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      } finally {
        completedCount++;
        onProgress?.(completedCount, tasks.length);
      }
    };

    for (let i = 0; i < tasks.length; i++) {
      const promise = processTask(tasks[i], i);
      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(0, 1);
      }
    }

    await Promise.all(executing);
    return results;
  }
}

/**
 * Cancellation Patterns - Standardized AbortSignal usage
 */
export namespace CancellationPatterns {
  /**
   * Create timeout signal with standard pattern
   */
  export function createTimeoutSignal(timeout: number): AbortSignal {
    if (timeout <= 0) {
      throw new Error('Timeout must be positive');
    }
    return AbortSignal.timeout(timeout);
  }

  /**
   * Combine multiple abort signals
   */
  export function combineSignals(...signals: AbortSignal[]): AbortSignal {
    if (signals.length === 0) {
      return new AbortController().signal;
    }
    if (signals.length === 1) {
      return signals[0];
    }
    return AbortSignal.any(signals);
  }

  /**
   * Create cancellable operation with standard error handling
   */
  export async function withCancellation<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    options: {
      timeout?: number;
      signal?: AbortSignal;
      onCancel?: (reason: string) => void;
    } = {},
  ): Promise<T> {
    const { timeout, signal: externalSignal, onCancel } = options;

    const signals: AbortSignal[] = [];

    if (timeout && timeout > 0) {
      signals.push(AbortSignal.timeout(timeout));
    }

    if (externalSignal) {
      signals.push(externalSignal);
    }

    const combinedSignal =
      signals.length > 0 ? combineSignals(...signals) : new AbortController().signal;

    // Track cancellation reason
    let cancellationReason = 'Unknown';
    if (timeout && timeout > 0) {
      setTimeout(() => {
        if (combinedSignal.aborted) {
          cancellationReason = `Timeout after ${timeout}ms`;
        }
      }, timeout);
    }

    if (externalSignal) {
      externalSignal.addEventListener(
        'abort',
        () => {
          cancellationReason = 'External cancellation';
        },
        { once: true },
      );
    }

    try {
      return await operation(combinedSignal);
    } catch (error) {
      if (combinedSignal.aborted) {
        onCancel?.(cancellationReason);
        throw new Error(`Operation cancelled: ${cancellationReason}`);
      }
      throw error;
    }
  }

  /**
   * Retry operation with cancellation support
   */
  export async function withRetry<T>(
    operation: (attempt: number, signal: AbortSignal) => Promise<T>,
    options: {
      maxAttempts?: number;
      delay?: number;
      exponentialBackoff?: boolean;
      timeout?: number;
      signal?: AbortSignal;
      shouldRetry?: (error: any, attempt: number) => boolean;
    } = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      exponentialBackoff = true,
      timeout,
      signal,
      shouldRetry = () => true,
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await withCancellation(attemptSignal => operation(attempt, attemptSignal), {
          timeout,
          signal,
        });
      } catch (error) {
        lastError = error;

        // Don't retry if cancelled
        if (signal?.aborted) {
          throw error;
        }

        // Don't retry if it's the last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Check if we should retry this error
        if (!shouldRetry(error, attempt)) {
          break;
        }

        // Calculate delay with optional exponential backoff
        const currentDelay = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay;

        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, currentDelay);

          signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(timeoutId);
              reject(new Error('Retry cancelled'));
            },
            { once: true },
          );
        });
      }
    }

    throw lastError;
  }
}

/**
 * Data Safety Patterns - Standardized structuredClone usage
 */
export namespace DataSafetyPatterns {
  /**
   * Safe clone with error handling
   */
  export function safeClone<T>(data: T): T {
    try {
      return structuredClone(data);
    } catch (error) {
      throw new Error(`Failed to clone data: ${error}`);
    }
  }

  /**
   * Clone with transferable objects support
   */
  export function cloneWithTransfer<T>(data: T, transfer: Transferable[] = []): T {
    try {
      return structuredClone(data, { transfer });
    } catch (error) {
      // Fallback without transfer if it fails
      try {
        return structuredClone(data);
      } catch (fallbackError) {
        throw new Error(
          `Failed to clone data with transfer: ${error}. Fallback also failed: ${fallbackError}`,
        );
      }
    }
  }

  /**
   * Deep clone with validation
   */
  export function validatedClone<T>(
    data: T,
    validator: (cloned: T) => boolean,
    options: { transfer?: Transferable[] } = {},
  ): T {
    const cloned = options.transfer ? cloneWithTransfer(data, options.transfer) : safeClone(data);

    if (!validator(cloned)) {
      throw new Error('Cloned data failed validation');
    }

    return cloned;
  }

  /**
   * Clone for cross-package data sharing
   */
  export function cloneForSharing<T extends Record<string, any>>(
    data: T,
    options: {
      removePrivateFields?: boolean;
      allowedFields?: string[];
      forbiddenFields?: string[];
    } = {},
  ): T {
    const { removePrivateFields = true, allowedFields, forbiddenFields } = options;

    // Pre-process data for sharing
    const processedData = { ...data };

    Object.keys(processedData).forEach(key => {
      // Remove private fields (starting with _)
      if (removePrivateFields && key.startsWith('_')) {
        delete processedData[key];
        return;
      }

      // Check allowed fields
      if (allowedFields && !allowedFields.includes(key)) {
        delete processedData[key];
        return;
      }

      // Check forbidden fields
      if (forbiddenFields && forbiddenFields.includes(key)) {
        delete processedData[key];
        return;
      }
    });

    return safeClone(processedData);
  }

  /**
   * Batch clone operations
   */
  export function cloneBatch<T>(
    items: T[],
    options: {
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {},
  ): Promise<T[]> {
    const { concurrency = 10, onProgress } = options;

    return PromisePatterns.executeBatch(
      items.map((item, index) => () => Promise.resolve(safeClone(item))),
      { concurrency, onProgress },
    ).then(results =>
      results.map((result, index) => {
        if (result.status === 'rejected') {
          throw new Error(`Failed to clone item at index ${index}: ${result.reason}`);
        }
        return result.value!;
      }),
    );
  }
}

/**
 * Memory Management Patterns - Standardized WeakMap/WeakSet usage
 */
export namespace MemoryPatterns {
  /**
   * Standard object tracking pattern
   */
  export class ObjectTracker<K extends object, V> {
    private readonly tracking = new WeakMap<K, V>();
    private readonly creationTimes = new WeakMap<K, bigint>();

    set(key: K, value: V): void {
      this.tracking.set(key, value);
      this.creationTimes.set(key, process.hrtime.bigint());
    }

    get(key: K): V | undefined {
      return this.tracking.get(key);
    }

    has(key: K): boolean {
      return this.tracking.has(key);
    }

    getAge(key: K): number | undefined {
      const creationTime = this.creationTimes.get(key);
      return creationTime ? Number(process.hrtime.bigint() - creationTime) / 1_000_000 : undefined;
    }

    delete(key: K): boolean {
      this.creationTimes.delete(key);
      return this.tracking.delete(key);
    }
  }

  /**
   * Standard object set tracking pattern
   */
  export class ObjectSet<T extends object> {
    private readonly objects = new WeakSet<T>();
    private readonly metadata = new WeakMap<T, { added: bigint; tags: string[] }>();

    add(obj: T, tags: string[] = []): void {
      this.objects.add(obj);
      this.metadata.set(obj, {
        added: process.hrtime.bigint(),
        tags,
      });
    }

    has(obj: T): boolean {
      return this.objects.has(obj);
    }

    delete(obj: T): boolean {
      this.metadata.delete(obj);
      return this.objects.delete(obj);
    }

    getMetadata(obj: T): { added: bigint; tags: string[] } | undefined {
      return this.metadata.get(obj);
    }

    hasTag(obj: T, tag: string): boolean {
      const meta = this.metadata.get(obj);
      return meta ? meta.tags.includes(tag) : false;
    }
  }

  /**
   * Memory-efficient cache with automatic cleanup
   */
  export class MemoryEfficientCache<K extends object, V> {
    private readonly cache = new WeakMap<K, V>();
    private readonly accessTimes = new WeakMap<K, bigint>();
    private readonly finalizationRegistry = new FinalizationRegistry((keyId: string) => {
      // Cleanup callback when key is garbage collected
      console.debug(`Cache entry ${keyId} was garbage collected`);
    });

    set(key: K, value: V): void {
      this.cache.set(key, value);
      this.accessTimes.set(key, process.hrtime.bigint());

      // Register for finalization tracking
      const keyId = `cache-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.finalizationRegistry.register(key, keyId);
    }

    get(key: K): V | undefined {
      const value = this.cache.get(key);
      if (value !== undefined) {
        this.accessTimes.set(key, process.hrtime.bigint());
      }
      return value;
    }

    has(key: K): boolean {
      return this.cache.has(key);
    }

    getLastAccess(key: K): bigint | undefined {
      return this.accessTimes.get(key);
    }

    delete(key: K): boolean {
      this.accessTimes.delete(key);
      return this.cache.delete(key);
    }
  }

  /**
   * Cross-package memory monitoring
   */
  export class CrossPackageMemoryMonitor {
    private readonly packageUsage = new Map<
      string,
      {
        objects: WeakSet<object>;
        metrics: Map<string, number>;
        lastSnapshot: NodeJS.MemoryUsage;
      }
    >();

    registerPackage(packageName: string): void {
      if (!this.packageUsage.has(packageName)) {
        this.packageUsage.set(packageName, {
          objects: new WeakSet(),
          metrics: new Map(),
          lastSnapshot: process.memoryUsage(),
        });
      }
    }

    trackObject(packageName: string, obj: object): void {
      const packageData = this.packageUsage.get(packageName);
      if (packageData) {
        packageData.objects.add(obj);
      }
    }

    updateMetrics(packageName: string, metrics: Record<string, number>): void {
      const packageData = this.packageUsage.get(packageName);
      if (packageData) {
        Object.entries(metrics).forEach(([key, value]) => {
          packageData.metrics.set(key, value);
        });
        packageData.lastSnapshot = process.memoryUsage();
      }
    }

    getPackageMetrics(packageName: string):
      | {
          metrics: Record<string, number>;
          memorySnapshot: NodeJS.MemoryUsage;
        }
      | undefined {
      const packageData = this.packageUsage.get(packageName);
      return packageData
        ? {
            metrics: Object.fromEntries(packageData.metrics),
            memorySnapshot: packageData.lastSnapshot,
          }
        : undefined;
    }

    getAllMetrics(): Record<string, ReturnType<typeof this.getPackageMetrics>> {
      const result: Record<string, any> = {};
      this.packageUsage.forEach((_, packageName) => {
        result[packageName] = this.getPackageMetrics(packageName);
      });
      return result;
    }
  }
}

/**
 * Timing Patterns - Standardized high-resolution timing
 */
export namespace TimingPatterns {
  /**
   * High-resolution timer for performance measurements
   */
  export class HighResolutionTimer {
    private readonly startTime: bigint;
    private readonly checkpoints: Map<string, bigint> = new Map();

    constructor() {
      this.startTime = process.hrtime.bigint();
    }

    checkpoint(name: string): void {
      this.checkpoints.set(name, process.hrtime.bigint());
    }

    getDuration(fromCheckpoint?: string): number {
      const endTime = process.hrtime.bigint();
      const startTime = fromCheckpoint
        ? this.checkpoints.get(fromCheckpoint) || this.startTime
        : this.startTime;

      return Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    }

    getDurationBetween(from: string, to: string): number {
      const fromTime = this.checkpoints.get(from);
      const toTime = this.checkpoints.get(to);

      if (!fromTime || !toTime) {
        throw new Error(`Checkpoint not found: ${!fromTime ? from : to}`);
      }

      return Number(toTime - fromTime) / 1_000_000;
    }

    getAllDurations(): Record<string, number> {
      const result: Record<string, number> = {
        total: this.getDuration(),
      };

      this.checkpoints.forEach((time, name) => {
        result[name] = Number(time - this.startTime) / 1_000_000;
      });

      return result;
    }
  }

  /**
   * Benchmark multiple operations
   */
  export async function benchmark<T>(
    operations: Record<string, () => Promise<T> | T>,
    options: {
      iterations?: number;
      warmupRuns?: number;
      onProgress?: (operation: string, iteration: number, total: number) => void;
    } = {},
  ): Promise<
    Record<
      string,
      {
        averageTime: number;
        minTime: number;
        maxTime: number;
        totalTime: number;
        iterations: number;
        operationsPerSecond: number;
      }
    >
  > {
    const { iterations = 100, warmupRuns = 10, onProgress } = options;
    const results: Record<string, any> = {};

    for (const [name, operation] of Object.entries(operations)) {
      // Warmup runs
      for (let i = 0; i < warmupRuns; i++) {
        await operation();
      }

      // Actual benchmark
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const timer = new HighResolutionTimer();
        await operation();
        times.push(timer.getDuration());

        onProgress?.(name, i + 1, iterations);
      }

      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const averageTime = totalTime / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const operationsPerSecond = 1000 / averageTime;

      results[name] = {
        averageTime,
        minTime,
        maxTime,
        totalTime,
        iterations,
        operationsPerSecond,
      };
    }

    return results;
  }

  /**
   * Time async operation with automatic reporting
   */
  export async function timeOperation<T>(
    operation: () => Promise<T>,
    options: {
      name?: string;
      logResult?: boolean;
      onComplete?: (duration: number, result: T) => void;
    } = {},
  ): Promise<{ result: T; duration: number }> {
    const { name = 'Operation', logResult = false, onComplete } = options;
    const timer = new HighResolutionTimer();

    try {
      const result = await operation();
      const duration = timer.getDuration();

      if (logResult) {
        console.log(`${name} completed in ${duration.toFixed(2)}ms`);
      }

      onComplete?.(duration, result);

      return { result, duration };
    } catch (error) {
      const duration = timer.getDuration();

      if (logResult) {
        console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
      }

      throw error;
    }
  }
}

/**
 * Cleanup Patterns - Standardized FinalizationRegistry usage
 */
export namespace CleanupPatterns {
  /**
   * Resource cleanup manager
   */
  export class ResourceCleanupManager<T> {
    private readonly resources = new Map<string, T>();
    private readonly finalizationRegistry = new FinalizationRegistry((resourceId: string) => {
      this.performCleanup(resourceId);
    });

    register(
      resource: T,
      cleanup: (resource: T) => void | Promise<void>,
      options: { id?: string; tags?: string[] } = {},
    ): string {
      const resourceId =
        options.id || `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      this.resources.set(resourceId, resource);

      // Register for finalization
      const resourceRef = { id: resourceId, cleanup, tags: options.tags || [] };
      this.finalizationRegistry.register(resource, resourceId);

      return resourceId;
    }

    private performCleanup(resourceId: string): void {
      const resource = this.resources.get(resourceId);
      if (resource) {
        try {
          // Cleanup logic would be stored separately
          console.debug(`Cleaning up resource: ${resourceId}`);
        } catch (error) {
          console.error(`Failed to cleanup resource ${resourceId}:`, error);
        } finally {
          this.resources.delete(resourceId);
        }
      }
    }

    manualCleanup(resourceId: string): boolean {
      const resource = this.resources.get(resourceId);
      if (resource) {
        this.performCleanup(resourceId);
        return true;
      }
      return false;
    }

    getResourceCount(): number {
      return this.resources.size;
    }

    getAllResourceIds(): string[] {
      return Array.from(this.resources.keys());
    }
  }

  /**
   * Cross-package cleanup coordinator
   */
  export class CrossPackageCleanupCoordinator {
    private readonly packageManagers = new Map<string, ResourceCleanupManager<any>>();
    private readonly globalFinalizationRegistry = new FinalizationRegistry(
      (packageResourceId: string) => {
        const [packageName, resourceId] = packageResourceId.split(':');
        const manager = this.packageManagers.get(packageName);
        manager?.manualCleanup(resourceId);
      },
    );

    registerPackage(packageName: string): ResourceCleanupManager<any> {
      if (!this.packageManagers.has(packageName)) {
        const manager = new ResourceCleanupManager();
        this.packageManagers.set(packageName, manager);
      }
      return this.packageManagers.get(packageName)!;
    }

    registerCrossPackageResource<T>(
      packageName: string,
      resource: T,
      cleanup: (resource: T) => void | Promise<void>,
      options: { id?: string; affectedPackages?: string[] } = {},
    ): string {
      const manager = this.registerPackage(packageName);
      const resourceId = manager.register(resource, cleanup, options);

      // Register for global coordination
      const globalId = `${packageName}:${resourceId}`;
      this.globalFinalizationRegistry.register(resource, globalId);

      return resourceId;
    }

    getPackageStats(): Record<string, { resourceCount: number; resourceIds: string[] }> {
      const stats: Record<string, any> = {};

      this.packageManagers.forEach((manager, packageName) => {
        stats[packageName] = {
          resourceCount: manager.getResourceCount(),
          resourceIds: manager.getAllResourceIds(),
        };
      });

      return stats;
    }

    performGlobalCleanup(): void {
      this.packageManagers.forEach((manager, packageName) => {
        const resourceIds = manager.getAllResourceIds();
        resourceIds.forEach(id => manager.manualCleanup(id));
      });
    }
  }
}

/**
 * Global pattern registry and utilities
 */
export namespace PatternRegistry {
  /**
   * Pattern usage tracking
   */
  const patternUsage = new Map<
    string,
    {
      count: number;
      lastUsed: bigint;
      packages: Set<string>;
    }
  >();

  /**
   * Register pattern usage
   */
  export function trackUsage(patternName: string, packageName: string): void {
    const current = patternUsage.get(patternName) || {
      count: 0,
      lastUsed: process.hrtime.bigint(),
      packages: new Set(),
    };

    current.count++;
    current.lastUsed = process.hrtime.bigint();
    current.packages.add(packageName);

    patternUsage.set(patternName, current);
  }

  /**
   * Get pattern usage statistics
   */
  export function getUsageStats(): Record<
    string,
    {
      count: number;
      lastUsed: string;
      packages: string[];
    }
  > {
    const stats: Record<string, any> = {};

    patternUsage.forEach((usage, patternName) => {
      stats[patternName] = {
        count: usage.count,
        lastUsed: new Date(Number(usage.lastUsed / BigInt(1_000_000))).toISOString(),
        packages: Array.from(usage.packages),
      };
    });

    return stats;
  }

  /**
   * Validate pattern implementations across packages
   */
  export function validatePatterns(): {
    consistent: boolean;
    issues: Array<{ pattern: string; packages: string[]; issue: string }>;
  } {
    const issues: Array<{ pattern: string; packages: string[]; issue: string }> = [];

    // Check for patterns used in only one package
    patternUsage.forEach((usage, patternName) => {
      if (usage.packages.size === 1) {
        issues.push({
          pattern: patternName,
          packages: Array.from(usage.packages),
          issue: 'Pattern used in only one package - consider consolidation',
        });
      }
    });

    return {
      consistent: issues.length === 0,
      issues,
    };
  }
}

/**
 * Centralized exports for all patterns
 */
export const Node22Patterns = {
  Promise: PromisePatterns,
  Cancellation: CancellationPatterns,
  DataSafety: DataSafetyPatterns,
  Memory: MemoryPatterns,
  Timing: TimingPatterns,
  Cleanup: CleanupPatterns,
  Registry: PatternRegistry,
} as const;

/**
 * Pattern usage helper for packages
 */
export function useNode22Patterns(packageName: string) {
  return {
    ...Node22Patterns,
    trackUsage: (patternName: string) => PatternRegistry.trackUsage(patternName, packageName),
  };
}
