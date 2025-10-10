/**
 * Worker Pool Manager for Node.js 22+
 * Provides efficient worker thread management for CPU-intensive operations
 */

import { EventEmitter } from 'node:events';
import { Worker, isMainThread } from 'node:worker_threads';
import { safeThrowIfAborted } from './abort-support';

export interface WorkerPoolOptions {
  maxWorkers?: number;
  minWorkers?: number;
  taskTimeout?: number;
  idleTimeout?: number;
  enableProfiling?: boolean;
}

export interface WorkerTask<T = any, R = any> {
  id: string;
  type: string;
  data: T;
  signal?: AbortSignal;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
  startTime: number;
  timeout?: number;
}

export interface WorkerInfo {
  id: string;
  worker: Worker;
  busy: boolean;
  currentTask?: string;
  tasksCompleted: number;
  totalTime: number;
  lastUsed: number;
  errors: number;
}

export interface WorkerPoolStats {
  totalWorkers: number;
  busyWorkers: number;
  idleWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskTime: number;
  totalTaskTime: number;
  workerUtilization: number;
}

/**
 * Worker Pool for managing concurrent CPU-intensive tasks
 */
export class WorkerPool extends EventEmitter {
  private workers = new Map<string, WorkerInfo>();
  private taskQueue: WorkerTask[] = [];
  private activeTasks = new Map<string, WorkerTask>();
  private completedTasks = 0;
  private failedTasks = 0;
  private totalTaskTime = 0;
  private workerScript: string;
  private options: Required<WorkerPoolOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  // O(1) bitmap-based worker discovery optimization
  private workerBitmap: number = 0; // Bitmap for idle workers (1 = idle, 0 = busy)
  private workerIdToIndex = new Map<string, number>(); // Maps worker ID to bitmap index
  private indexToWorkerId = new Map<number, string>(); // Maps bitmap index to worker ID

  constructor(workerScript: string, options: WorkerPoolOptions = {}) {
    super();

    this.workerScript = workerScript;

    // Use static values to avoid async in constructor
    const os = require('os');
    this.options = {
      maxWorkers: options.maxWorkers || Math.max(2, Math.min(8, os.cpus().length)),
      minWorkers: options.minWorkers || 1,
      taskTimeout: options.taskTimeout || 30000, // 30 seconds
      idleTimeout: options.idleTimeout || 60000, // 1 minute
      enableProfiling: options.enableProfiling || false,
    };

    // Initialize minimum workers
    this.initializeMinWorkers();

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Execute a task in the worker pool
   */
  async execute<T, R>(
    taskType: string,
    taskData: T,
    options: { timeout?: number; signal?: AbortSignal } = {},
  ): Promise<R> {
    if (this.isDestroyed) {
      throw new Error('WorkerPool has been destroyed');
    }

    const { timeout = this.options.taskTimeout, signal } = options;

    // Check abort signal immediately
    safeThrowIfAborted(signal);

    const taskId = this.generateTaskId();

    return new Promise<R>((resolve, reject) => {
      const task: WorkerTask<T, R> = {
        id: taskId,
        type: taskType,
        data: taskData,
        signal,
        resolve,
        reject,
        startTime: Date.now(),
        timeout,
      };

      // Add abort listener if signal provided
      if (signal) {
        const onAbort = () => {
          this.cancelTask(taskId);
          reject(new Error('Task aborted'));
        };

        if (signal.aborted) {
          onAbort();
          return;
        }

        signal.addEventListener('abort', onAbort, { once: true });

        // Store cleanup function on task
        (task as any).cleanup = () => {
          signal.removeEventListener('abort', onAbort);
        };
      }

      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  /**
   * Get current pool statistics
   */
  getStats(): WorkerPoolStats {
    const busyWorkers = Array.from(this.workers.values()).filter(w => w.busy).length;
    const totalWorkers = this.workers.size;

    return {
      totalWorkers,
      busyWorkers,
      idleWorkers: totalWorkers - busyWorkers,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      averageTaskTime: this.completedTasks > 0 ? this.totalTaskTime / this.completedTasks : 0,
      totalTaskTime: this.totalTaskTime,
      workerUtilization: totalWorkers > 0 ? (busyWorkers / totalWorkers) * 100 : 0,
    };
  }

  /**
   * Destroy the worker pool and terminate all workers
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Cancel all queued tasks
    for (const task of this.taskQueue) {
      task.reject(new Error('WorkerPool destroyed'));
      this.cleanupTask(task);
    }
    this.taskQueue.length = 0;

    // Cancel all active tasks
    for (const task of this.activeTasks.values()) {
      task.reject(new Error('WorkerPool destroyed'));
      this.cleanupTask(task);
    }
    this.activeTasks.clear();

    // Terminate all workers
    const terminationPromises = Array.from(this.workers.values()).map(async workerInfo => {
      try {
        await workerInfo.worker.terminate();
      } catch (error) {
        console.error(`Error terminating worker ${workerInfo.id}:`, error);
      }
    });

    await Promise.all(terminationPromises);
    this.workers.clear();

    this.emit('destroyed');
  }

  private initializeMinWorkers(): void {
    for (let i = 0; i < this.options.minWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): WorkerInfo {
    const workerId = this.generateWorkerId();

    const worker = new Worker(this.workerScript, {
      workerData: {
        workerId,
        enableProfiling: this.options.enableProfiling,
      },
    });

    const workerInfo: WorkerInfo = {
      id: workerId,
      worker,
      busy: false,
      tasksCompleted: 0,
      totalTime: 0,
      lastUsed: Date.now(),
      errors: 0,
    };

    // Set up worker event handlers
    worker.on('message', message => {
      this.handleWorkerMessage(workerInfo, message);
    });

    worker.on('error', error => {
      this.handleWorkerError(workerInfo, error);
    });

    worker.on('exit', code => {
      this.handleWorkerExit(workerInfo, code);
    });

    this.workers.set(workerId, workerInfo);
    this.addWorkerToBitmap(workerId); // Add to bitmap for O(1) discovery
    this.emit('workerCreated', workerInfo);

    return workerInfo;
  }

  private processQueue(): void {
    if (this.taskQueue.length === 0 || this.isDestroyed) return;

    // Find available worker using O(1) bitmap lookup
    let availableWorker = this.findIdleWorker();

    // Create new worker if none available and under max limit
    if (!availableWorker && this.workers.size < this.options.maxWorkers) {
      availableWorker = this.createWorker();
    }

    if (availableWorker) {
      const task = this.taskQueue.shift();
      if (task) {
        this.assignTaskToWorker(availableWorker, task);

        // Continue processing queue if more tasks exist
        if (this.taskQueue.length > 0) {
          setImmediate(() => this.processQueue());
        }
      }
    }
  }

  private assignTaskToWorker(workerInfo: WorkerInfo, task: WorkerTask): void {
    // Check if task was aborted while waiting
    if (task.signal?.aborted) {
      task.reject(new Error('Task aborted'));
      this.cleanupTask(task);
      return;
    }

    workerInfo.busy = true;
    workerInfo.currentTask = task.id;
    workerInfo.lastUsed = Date.now();
    this.setWorkerBusy(workerInfo.id); // Update bitmap

    this.activeTasks.set(task.id, task);

    // Set up task timeout
    const timeout = setTimeout(() => {
      this.handleTaskTimeout(task);
    }, task.timeout || this.options.taskTimeout);

    (task as any).timeoutId = timeout;

    // Send task to worker
    workerInfo.worker.postMessage({
      taskId: task.id,
      type: task.type,
      data: task.data,
    });

    this.emit('taskStarted', { taskId: task.id, workerId: workerInfo.id });
  }

  private handleWorkerMessage(workerInfo: WorkerInfo, message: any): void {
    const { taskId, success, result, error, duration } = message;

    const task = this.activeTasks.get(taskId);
    if (!task) return;

    // Clear timeout
    if ((task as any).timeoutId) {
      clearTimeout((task as any).timeoutId);
    }

    // Update worker stats
    workerInfo.busy = false;
    workerInfo.currentTask = undefined;
    workerInfo.tasksCompleted++;
    workerInfo.totalTime += duration || 0;
    this.setWorkerIdle(workerInfo.id); // Update bitmap

    // Update pool stats
    this.totalTaskTime += duration || 0;

    // Remove task from active tasks
    this.activeTasks.delete(taskId);

    if (success) {
      this.completedTasks++;
      task.resolve(result);
      this.emit('taskCompleted', { taskId, workerId: workerInfo.id, duration });
    } else {
      this.failedTasks++;
      workerInfo.errors++;
      task.reject(new Error(error || 'Worker task failed'));
      this.emit('taskFailed', { taskId, workerId: workerInfo.id, error });
    }

    this.cleanupTask(task);

    // Process more tasks if available
    setImmediate(() => this.processQueue());
  }

  private handleWorkerError(workerInfo: WorkerInfo, error: Error): void {
    workerInfo.errors++;
    this.emit('workerError', { workerId: workerInfo.id, error });

    // Handle current task if any
    if (workerInfo.currentTask) {
      const task = this.activeTasks.get(workerInfo.currentTask);
      if (task) {
        this.failedTasks++;
        task.reject(error);
        this.activeTasks.delete(workerInfo.currentTask);
        this.cleanupTask(task);
      }
    }

    // Remove and replace worker
    this.workers.delete(workerInfo.id);
    this.removeWorkerFromBitmap(workerInfo.id); // Remove from bitmap

    if (!this.isDestroyed && this.workers.size < this.options.minWorkers) {
      setImmediate(() => this.createWorker());
    }
  }

  private handleWorkerExit(workerInfo: WorkerInfo, code: number): void {
    this.emit('workerExit', { workerId: workerInfo.id, exitCode: code });

    // Handle current task if any
    if (workerInfo.currentTask) {
      const task = this.activeTasks.get(workerInfo.currentTask);
      if (task) {
        this.failedTasks++;
        task.reject(new Error(`Worker exited with code ${code}`));
        this.activeTasks.delete(workerInfo.currentTask);
        this.cleanupTask(task);
      }
    }

    // Remove worker
    this.workers.delete(workerInfo.id);
    this.removeWorkerFromBitmap(workerInfo.id); // Remove from bitmap

    if (!this.isDestroyed && this.workers.size < this.options.minWorkers) {
      setImmediate(() => this.createWorker());
    }
  }

  private handleTaskTimeout(task: WorkerTask): void {
    if (!this.activeTasks.has(task.id)) return;

    this.activeTasks.delete(task.id);
    this.failedTasks++;

    task.reject(new Error(`Task timeout after ${task.timeout}ms`));
    this.cleanupTask(task);

    // Find and reset the worker
    const workerInfo = Array.from(this.workers.values()).find(w => w.currentTask === task.id);

    if (workerInfo) {
      workerInfo.busy = false;
      workerInfo.currentTask = undefined;
      workerInfo.errors++;
      this.setWorkerIdle(workerInfo.id); // Update bitmap
    }

    this.emit('taskTimeout', { taskId: task.id });
  }

  private cancelTask(taskId: string): void {
    // Remove from queue if not started
    const queueIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (queueIndex >= 0) {
      const [task] = this.taskQueue.splice(queueIndex, 1);
      this.cleanupTask(task);
      return;
    }

    // Handle active task
    const task = this.activeTasks.get(taskId);
    if (task) {
      if ((task as any).timeoutId) {
        clearTimeout((task as any).timeoutId);
      }

      this.activeTasks.delete(taskId);
      this.cleanupTask(task);

      // Reset worker
      const workerInfo = Array.from(this.workers.values()).find(w => w.currentTask === taskId);

      if (workerInfo) {
        workerInfo.busy = false;
        workerInfo.currentTask = undefined;
        this.setWorkerIdle(workerInfo.id); // Update bitmap
      }
    }
  }

  private cleanupTask(task: WorkerTask): void {
    if ((task as any).cleanup) {
      (task as any).cleanup();
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupIdleWorkers();
    }, this.options.idleTimeout / 2);

    // Unref to not block process exit
    this.cleanupInterval.unref();
  }

  private cleanupIdleWorkers(): void {
    if (this.isDestroyed || this.workers.size <= this.options.minWorkers) return;

    const now = Date.now();
    const workersToRemove: WorkerInfo[] = [];

    for (const workerInfo of this.workers.values()) {
      if (
        !workerInfo.busy &&
        now - workerInfo.lastUsed > this.options.idleTimeout &&
        this.workers.size > this.options.minWorkers
      ) {
        workersToRemove.push(workerInfo);
      }
    }

    // Remove idle workers
    for (const workerInfo of workersToRemove) {
      if (this.workers.size <= this.options.minWorkers) break;

      this.workers.delete(workerInfo.id);
      this.removeWorkerFromBitmap(workerInfo.id); // Remove from bitmap
      void workerInfo.worker.terminate();
      this.emit('workerTerminated', { workerId: workerInfo.id, reason: 'idle' });
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
  }

  private generateWorkerId(): string {
    return `worker_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
  }

  // Bitmap-based worker discovery helper methods
  private setWorkerIdle(workerId: string): void {
    const index = this.workerIdToIndex.get(workerId);
    if (index !== undefined) {
      this.workerBitmap |= 1 << index; // Set bit to 1 (idle)
    }
  }

  private setWorkerBusy(workerId: string): void {
    const index = this.workerIdToIndex.get(workerId);
    if (index !== undefined) {
      this.workerBitmap &= ~(1 << index); // Clear bit to 0 (busy)
    }
  }

  private findIdleWorker(): WorkerInfo | undefined {
    // O(1) operation: find first set bit (idle worker)
    if (this.workerBitmap === 0) return undefined;

    // Use bit manipulation to find the lowest set bit
    const idleIndex = Math.log2(this.workerBitmap & -this.workerBitmap);
    const workerId = this.indexToWorkerId.get(idleIndex);

    return workerId ? this.workers.get(workerId) : undefined;
  }

  private addWorkerToBitmap(workerId: string): number {
    // Find next available bitmap index
    let index = 0;
    while (index < 32 && this.indexToWorkerId.has(index)) {
      index++;
    }

    if (index >= 32) {
      throw new Error('Maximum workers exceeded for bitmap optimization');
    }

    this.workerIdToIndex.set(workerId, index);
    this.indexToWorkerId.set(index, workerId);
    this.setWorkerIdle(workerId); // New workers start as idle

    return index;
  }

  private removeWorkerFromBitmap(workerId: string): void {
    const index = this.workerIdToIndex.get(workerId);
    if (index !== undefined) {
      this.workerBitmap &= ~(1 << index); // Clear the bit
      this.workerIdToIndex.delete(workerId);
      this.indexToWorkerId.delete(index);
    }
  }
}

/**
 * Helper function for creating worker scripts
 * SECURITY: Removed eval() usage to prevent RCE vulnerabilities
 */
export function createWorkerScript(
  handlers: Record<string, (data: any) => Promise<any> | any>,
): string {
  // Security: Enhanced validation with comprehensive security checks
  class WorkerSecurityValidator {
    private static readonly DANGEROUS_PATTERNS = [
      // Direct execution patterns
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /\bnew\s+Function\s*\(/,

      // Process and system access
      /\bprocess\s*[\.\[]/,
      /\bglobal\s*[\.\[]/,
      /\bglobalThis\s*[\.\[]/,
      /\b__dirname\b/,
      /\b__filename\b/,

      // Module loading
      /\brequire\s*\(/,
      /\bimport\s*\(/,

      // Dangerous modules
      /child_process/,
      /\bfs\b/,
      /\bnet\b/,
      /\bhttp\b/,

      // Prototype pollution
      /\bconstructor\s*[\.\[]/,
      /\b__proto__\s*[\.\[]/,
      /\bprototype\s*[\.\[]/,
    ];

    static validateHandlers(handlers: Record<string, any>): Record<string, string> {
      if (Object.keys(handlers).length > 50) {
        throw new Error('Too many handlers - security limit exceeded');
      }

      return Object.entries(handlers).reduce(
        (acc, [key, handler]) => {
          this.validateHandler(key, handler);
          acc[key] = handler.toString();
          return acc;
        },
        {} as Record<string, string>,
      );
    }

    private static validateHandler(key: string, handler: any): void {
      if (typeof handler !== 'function') {
        throw new Error(`Handler for '${key}' must be a function`);
      }

      const source = handler.toString();

      // Security: Check function size to prevent DoS
      if (source.length > 10000) {
        throw new Error(`Handler '${key}' is too large (${source.length} chars)`);
      }

      // Security: Check for dangerous patterns
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(source)) {
          throw new Error(`Handler '${key}' contains dangerous pattern: ${pattern.toString()}`);
        }
      }
    }
  }

  const validatedHandlers = WorkerSecurityValidator.validateHandlers(handlers);

  return `
    const { parentPort, workerData } = require('worker_threads');
    const { workerId, enableProfiling } = workerData;
    const vm = require('vm');
    
    // Security: Enhanced VM context with comprehensive restrictions
    class SecureVMContext {
      static createRestrictedContext() {
        const safeBuiltins = Object.create(null);
        
        // Only expose truly safe operations
        safeBuiltins.Array = Array;
        safeBuiltins.Object = {
          keys: Object.keys,
          values: Object.values,
          entries: Object.entries,
          assign: Object.assign,
        };
        safeBuiltins.String = String;
        safeBuiltins.Number = Number;
        safeBuiltins.Boolean = Boolean;
        safeBuiltins.JSON = { parse: JSON.parse, stringify: JSON.stringify };
        safeBuiltins.Date = Date;
        safeBuiltins.Math = Math;
        safeBuiltins.Promise = Promise;
        
        // Restricted console for debugging
        safeBuiltins.console = {
          log: (...args) => console.log('[WORKER]', ...args),
          warn: (...args) => console.warn('[WORKER]', ...args),
          error: (...args) => console.error('[WORKER]', ...args)
        };
        
        // Security: Explicitly poison dangerous globals
        const poisonedGlobals = {
          eval: () => { throw new Error('eval not allowed'); },
          Function: () => { throw new Error('Function constructor not allowed'); },
          require: () => { throw new Error('require not allowed'); },
          process: () => { throw new Error('process access not allowed'); },
          global: () => { throw new Error('global access not allowed'); },
          Buffer: undefined,
          setTimeout: () => { throw new Error('setTimeout not allowed'); },
          constructor: undefined,
          __proto__: undefined,
          prototype: undefined,
        };
        
        return Object.assign(Object.create(null), safeBuiltins, poisonedGlobals);
      }
    }
    
    const safeContext = SecureVMContext.createRestrictedContext();
    
    const handlerEntries = ${JSON.stringify(Object.entries(validatedHandlers))};
    
    const handlers = handlerEntries.reduce((acc, [key, functionSource]) => {
      try {
        // Security: Enhanced VM compilation with strict mode
        const wrappedSource = \`
          'use strict';
          (function() {
            if (typeof this !== 'undefined' && this !== null) {
              throw new Error('Unexpected this context');
            }
            return (\${functionSource});
          })()
        \`;
        
        acc[key] = vm.runInNewContext(wrappedSource, safeContext, {
          timeout: 3000, // Reduced timeout for security
          displayErrors: false, // Don't leak error details
          contextName: \`worker-handler-\${key}\`,
          contextCodeGeneration: {
            strings: false, // Disable string-to-code generation
            wasm: false, // Disable WASM generation
          },
        });
        
        // Security: Comprehensive validation
        if (typeof acc[key] !== 'function') {
          throw new Error(\`Handler '\${key}' compilation failed\`);
        }
        
        // Security: Wrap function with runtime protections
        const originalFn = acc[key];
        acc[key] = function secureWrapper(data) {
          if (data && typeof data === 'object') {
            if ('constructor' in data || '__proto__' in data) {
              throw new Error('Dangerous properties in input data');
            }
          }
          return originalFn.call(null, data);
        };
      } catch (error) {
        throw new Error(\`Failed to compile handler '\${key}': \${error.message}\`);
      }
      return acc;
    }, {});
    
    parentPort.on('message', async ({ taskId, type, data }) => {
      const startTime = enableProfiling ? performance.now() : 0;
      
      try {
        const handler = handlers[type];
        if (!handler) {
          throw new Error(\`Unknown task type: \${type}\`);
        }
        
        const result = await handler(data);
        const duration = enableProfiling ? performance.now() - startTime : 0;
        
        parentPort.postMessage({
          taskId,
          success: true,
          result,
          duration,
        });
      } catch (error) {
        const duration = enableProfiling ? performance.now() - startTime : 0;
        
        parentPort.postMessage({
          taskId,
          success: false,
          error: error.message,
          duration,
        });
      }
    });
  `;
}

/**
 * Global worker pool instance for shared use
 */
let globalWorkerPool: WorkerPool | null = null;

export function getGlobalWorkerPool(
  workerScript?: string,
  options?: WorkerPoolOptions,
): WorkerPool {
  if (!globalWorkerPool) {
    if (!workerScript) {
      throw new Error('Worker script required for first initialization');
    }
    globalWorkerPool = new WorkerPool(workerScript, options);
  }
  return globalWorkerPool;
}

export function destroyGlobalWorkerPool(): Promise<void> | void {
  if (globalWorkerPool) {
    const pool = globalWorkerPool;
    globalWorkerPool = null;
    return pool.destroy();
  }
}

// Ensure cleanup on process exit
if (isMainThread) {
  process.on('beforeExit', () => {
    if (globalWorkerPool) {
      void destroyGlobalWorkerPool();
    }
  });
}
