import { EventEmitter } from 'events';

export interface BulkheadConfig {
  isolationMode: 'thread' | 'semaphore'; // Isolation strategy
  maxConcurrent: number; // Maximum concurrent executions
  maxWaiting: number; // Maximum queued requests
  name: string;
  timeout: number; // Timeout for queued requests
}

export interface BulkheadStats {
  averageExecutionTime: number;
  averageWaitTime: number;
  completedExecutions: number;
  currentExecutions: number;
  failedExecutions: number;
  maxConcurrent: number;
  name: string;
  queuedRequests: number;
  rejectedExecutions: number;
  totalExecutions: number;
}

export class BulkheadError extends Error {
  constructor(
    message: string,
    public readonly bulkheadName: string,
    public readonly reason: 'capacity_exceeded' | 'queue_full' | 'timeout',
  ) {
    super(message);
    this.name = 'BulkheadError';
  }
}

export class Bulkhead extends EventEmitter {
  private currentExecutions = 0;
  private queue: {
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
    timeoutId: NodeJS.Timeout;
  }[] = [];

  private stats = {
    completedExecutions: 0,
    failedExecutions: 0,
    rejectedExecutions: 0,
    totalExecutions: 0,
    totalExecutionTime: 0,
    totalWaitTime: 0,
  };

  constructor(private config: BulkheadConfig) {
    super();
    this.validateConfig();
  }

  private validateConfig(): void {
    const { maxConcurrent, maxWaiting, timeout } = this.config;

    if (maxConcurrent <= 0) throw new Error('maxConcurrent must be positive');
    if (maxWaiting < 0) throw new Error('maxWaiting cannot be negative');
    if (timeout <= 0) throw new Error('timeout must be positive');
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.stats.totalExecutions++;

    // Check if we can execute immediately
    if (this.currentExecutions < this.config.maxConcurrent) {
      return this.executeImmediately(operation);
    }

    // Check if we can queue the request
    if (this.queue.length >= this.config.maxWaiting) {
      this.stats.rejectedExecutions++;
      this.emit('requestRejected', {
        bulkheadName: this.config.name,
        queueLength: this.queue.length,
        reason: 'queue_full',
      });

      throw new BulkheadError(
        `Bulkhead ${this.config.name} queue is full (${this.queue.length}/${this.config.maxWaiting})`,
        this.config.name,
        'queue_full',
      );
    }

    // Queue the request
    return this.queueRequest(operation);
  }

  private async executeImmediately<T>(operation: () => Promise<T>): Promise<T> {
    this.currentExecutions++;
    const startTime = Date.now();

    this.emit('executionStarted', {
      bulkheadName: this.config.name,
      currentExecutions: this.currentExecutions,
      queuedRequests: this.queue.length,
    });

    try {
      const result = await operation();

      const executionTime = Date.now() - startTime;
      this.stats.completedExecutions++;
      this.stats.totalExecutionTime += executionTime;

      this.emit('executionCompleted', {
        bulkheadName: this.config.name,
        executionTime,
        success: true,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.stats.failedExecutions++;
      this.stats.totalExecutionTime += executionTime;

      this.emit('executionCompleted', {
        bulkheadName: this.config.name,
        error,
        executionTime,
        success: false,
      });

      throw error;
    } finally {
      this.currentExecutions--;
      this.processQueue();
    }
  }

  private async queueRequest<T>(operation: () => Promise<T>): Promise<T> {
    const queueStartTime = Date.now();

    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        // Remove from queue if still there
        const index = this.queue.findIndex((item) => item.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
        }

        this.stats.rejectedExecutions++;
        this.emit('requestTimeout', {
          bulkheadName: this.config.name,
          waitTime: Date.now() - queueStartTime,
        });

        reject(
          new BulkheadError(
            `Request timeout in bulkhead ${this.config.name} after ${this.config.timeout}ms`,
            this.config.name,
            'timeout',
          ),
        );
      }, this.config.timeout);

      this.queue.push({
        operation: async () => {
          const waitTime = Date.now() - queueStartTime;
          this.stats.totalWaitTime += waitTime;

          this.emit('requestDequeued', {
            bulkheadName: this.config.name,
            queuePosition: 0,
            waitTime,
          });

          return this.executeImmediately(operation);
        },
        reject,
        resolve,
        timeoutId,
        timestamp: queueStartTime,
      });

      this.emit('requestQueued', {
        bulkheadName: this.config.name,
        queueLength: this.queue.length,
        queuePosition: this.queue.length,
      });
    });
  }

  private processQueue(): void {
    if (this.queue.length === 0 || this.currentExecutions >= this.config.maxConcurrent) {
      return;
    }

    const nextRequest = this.queue.shift();
    if (nextRequest) {
      clearTimeout(nextRequest.timeoutId);

      nextRequest.operation().then(nextRequest.resolve).catch(nextRequest.reject);
    }
  }

  // Monitoring and stats
  getStats(): BulkheadStats {
    const averageExecutionTime =
      this.stats.completedExecutions > 0
        ? this.stats.totalExecutionTime / this.stats.completedExecutions
        : 0;

    const totalWaited = this.stats.totalExecutions - this.stats.rejectedExecutions;
    const averageWaitTime = totalWaited > 0 ? this.stats.totalWaitTime / totalWaited : 0;

    return {
      name: this.config.name,
      averageExecutionTime,
      averageWaitTime,
      completedExecutions: this.stats.completedExecutions,
      currentExecutions: this.currentExecutions,
      failedExecutions: this.stats.failedExecutions,
      maxConcurrent: this.config.maxConcurrent,
      queuedRequests: this.queue.length,
      rejectedExecutions: this.stats.rejectedExecutions,
      totalExecutions: this.stats.totalExecutions,
    };
  }

  getName(): string {
    return this.config.name;
  }

  getConfig(): BulkheadConfig {
    return { ...this.config };
  }

  // Health and capacity checks
  isHealthy(): boolean {
    const rejectionRate =
      this.stats.totalExecutions > 0
        ? (this.stats.rejectedExecutions / this.stats.totalExecutions) * 100
        : 0;

    return rejectionRate < 10; // Healthy if less than 10% rejection rate
  }

  getCapacityUtilization(): number {
    return (this.currentExecutions / this.config.maxConcurrent) * 100;
  }

  getQueueUtilization(): number {
    return this.config.maxWaiting > 0 ? (this.queue.length / this.config.maxWaiting) * 100 : 0;
  }

  // Manual control
  updateConfig(newConfig: Partial<BulkheadConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    this.validateConfig();

    this.emit('configUpdated', {
      bulkheadName: this.config.name,
      newConfig: this.config,
      oldConfig,
    });

    // Process queue if capacity increased
    if (newConfig.maxConcurrent && newConfig.maxConcurrent > oldConfig.maxConcurrent) {
      this.processQueue();
    }
  }

  // Graceful shutdown
  async shutdown(timeoutMs = 30000): Promise<void> {
    const startTime = Date.now();

    // Reject all queued requests
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        clearTimeout(request.timeoutId);
        request.reject(
          new BulkheadError(
            `Bulkhead ${this.config.name} is shutting down`,
            this.config.name,
            'capacity_exceeded',
          ),
        );
      }
    }

    // Wait for current executions to complete
    while (this.currentExecutions > 0 && Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.currentExecutions > 0) {
      console.warn(
        `Bulkhead ${this.config.name} shutdown timeout: ${this.currentExecutions} executions still running`,
      );
    }

    this.removeAllListeners();
  }

  reset(): void {
    // Clear queue
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        clearTimeout(request.timeoutId);
        request.reject(
          new BulkheadError(
            `Bulkhead ${this.config.name} was reset`,
            this.config.name,
            'capacity_exceeded',
          ),
        );
      }
    }

    // Reset stats
    this.stats = {
      completedExecutions: 0,
      failedExecutions: 0,
      rejectedExecutions: 0,
      totalExecutions: 0,
      totalExecutionTime: 0,
      totalWaitTime: 0,
    };

    this.emit('bulkheadReset', {
      bulkheadName: this.config.name,
    });
  }
}

// Bulkhead registry for managing multiple bulkheads
export class BulkheadRegistry {
  private bulkheads = new Map<string, Bulkhead>();

  create(config: BulkheadConfig): Bulkhead {
    if (this.bulkheads.has(config.name)) {
      throw new Error(`Bulkhead ${config.name} already exists`);
    }

    const bulkhead = new Bulkhead(config);
    this.bulkheads.set(config.name, bulkhead);

    // Forward important events
    bulkhead.on('requestRejected', (event) => {
      console.warn(`Bulkhead request rejected: ${event.bulkheadName} - ${event.reason}`);
    });

    return bulkhead;
  }

  get(name: string): Bulkhead | undefined {
    return this.bulkheads.get(name);
  }

  getOrCreate(config: BulkheadConfig): Bulkhead {
    const existing = this.bulkheads.get(config.name);
    if (existing) {
      return existing;
    }
    return this.create(config);
  }

  remove(name: string): boolean {
    const bulkhead = this.bulkheads.get(name);
    if (bulkhead) {
      bulkhead.shutdown();
      return this.bulkheads.delete(name);
    }
    return false;
  }

  list(): string[] {
    return Array.from(this.bulkheads.keys());
  }

  getAllStats(): Record<string, BulkheadStats> {
    const stats: Record<string, BulkheadStats> = {};
    for (const [name, bulkhead] of this.bulkheads) {
      stats[name] = bulkhead.getStats();
    }
    return stats;
  }

  getHealthyBulkheads(): string[] {
    return Array.from(this.bulkheads.entries())
      .filter(([, bulkhead]) => bulkhead.isHealthy())
      .map(([name]) => name);
  }

  getUnhealthyBulkheads(): string[] {
    return Array.from(this.bulkheads.entries())
      .filter(([, bulkhead]) => !bulkhead.isHealthy())
      .map(([name]) => name);
  }

  // Global capacity monitoring
  getTotalCapacityUtilization(): number {
    const bulkheadArray = Array.from(this.bulkheads.values());
    if (bulkheadArray.length === 0) return 0;

    const totalUtilization = bulkheadArray.reduce((sum, bulkhead) => {
      return sum + bulkhead.getCapacityUtilization();
    }, 0);

    return totalUtilization / bulkheadArray.length;
  }

  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this.bulkheads.values()).map((bulkhead) =>
      bulkhead.shutdown(),
    );

    await Promise.all(shutdownPromises);
    this.bulkheads.clear();
  }
}

// Default configurations for common use cases
export const DEFAULT_BULKHEAD_CONFIGS = {
  computation: {
    isolationMode: 'thread' as const,
    maxConcurrent: 4, // Usually CPU cores
    maxWaiting: 10,
    timeout: 60000,
  },
  database: {
    isolationMode: 'semaphore' as const,
    maxConcurrent: 10,
    maxWaiting: 50,
    timeout: 30000,
  },
  fileSystem: {
    isolationMode: 'semaphore' as const,
    maxConcurrent: 5,
    maxWaiting: 20,
    timeout: 15000,
  },
  http: {
    isolationMode: 'semaphore' as const,
    maxConcurrent: 20,
    maxWaiting: 100,
    timeout: 45000,
  },
};

// Global registry instance
export const bulkheadRegistry = new BulkheadRegistry();

// Utility decorator for bulkhead isolation
export function Isolated(bulkheadName: string, config?: Partial<BulkheadConfig>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let bulkhead = bulkheadRegistry.get(bulkheadName);

      if (!bulkhead && config) {
        bulkhead = bulkheadRegistry.create({
          name: bulkheadName,
          ...DEFAULT_BULKHEAD_CONFIGS.http,
          ...config,
        });
      }

      if (!bulkhead) {
        throw new Error(`Bulkhead ${bulkheadName} not found and no config provided`);
      }

      return bulkhead.execute(() => method.apply(this, args));
    };

    return descriptor;
  };
}
