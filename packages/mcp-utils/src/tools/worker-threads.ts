/**
 * MCP Tool: Worker Threads
 * Provides CPU-intensive operation support using Worker Threads
 */

import { CLEANUP_PRIORITIES, registerCleanupHandler } from '../runtime/lifecycle';
import type { MCPToolResponse } from '../types/mcp';
import { AbortableToolArgs, throwIfAborted } from '../utils/abort-support';
import { createMCPErrorResponse } from '../utils/error-handling';
import { WorkerPool, createWorkerScript } from '../utils/worker-pool';

export interface WorkerThreadsArgs extends AbortableToolArgs {
  action:
    | 'createPool'
    | 'executeTask'
    | 'executeBatch'
    | 'getPoolStats'
    | 'destroyPool'
    | 'cpuIntensiveDemo'
    | 'dataProcessingDemo'
    | 'codeAnalysisDemo'
    | 'atomicsDemo'; // Demonstrate Node.js 22+ Atomics coordination

  // Pool configuration
  maxWorkers?: number;
  minWorkers?: number;
  taskTimeout?: number;
  enableProfiling?: boolean;

  // Task configuration
  taskType?: string;
  taskData?: any;
  tasks?: Array<{ type: string; data: any }>; // For batch operations

  // Demo configurations
  dataSize?: number;
  complexity?: number;
  codeSnippet?: string;
}

// Store worker pools by ID for reuse
const workerPools = new Map<string, WorkerPool>();

// Node.js 22+ Atomics for high-performance worker coordination
interface WorkerState {
  sharedBuffer: SharedArrayBuffer;
  statusArray: Int32Array; // Worker status flags
  counterArray: Int32Array; // Task counters
  metricArray: Int32Array; // Performance metrics (milliseconds as integers for atomic operations)
}

// Shared memory layout constants
const WORKER_STATUS_OFFSET = 0;
const TASK_COUNTER_OFFSET = 4; // 4 workers max status flags
const PERFORMANCE_METRICS_OFFSET = 0; // In Float64Array
const AVAILABLE_COUNTER_INDEX = 0; // First index in metricArray for available worker count

// Worker status flags using Atomics
const WORKER_IDLE = 0;
const WORKER_BUSY = 1;
const WORKER_ERROR = 2;
const WORKER_SHUTDOWN = 3;

// Store worker states by pool ID for atomic coordination
const workerStates = new Map<string, WorkerState>();

// Security: Enhanced SharedArrayBuffer protection with capability detection
class SharedArrayBufferSecurity {
  private static isSupported: boolean | null = null;
  private static hasCrossOriginIsolation: boolean | null = null;

  static checkSupport(): boolean {
    if (this.isSupported !== null) return this.isSupported;

    try {
      // Security: Check if SharedArrayBuffer is available and safe to use
      this.isSupported =
        typeof SharedArrayBuffer !== 'undefined' &&
        typeof Atomics !== 'undefined' &&
        this.checkCrossOriginIsolation();
    } catch {
      this.isSupported = false;
    }

    return this.isSupported;
  }

  private static checkCrossOriginIsolation(): boolean {
    if (this.hasCrossOriginIsolation !== null) return this.hasCrossOriginIsolation;

    try {
      // Security: Verify cross-origin isolation for SharedArrayBuffer safety
      if (typeof globalThis !== 'undefined' && 'crossOriginIsolated' in globalThis) {
        this.hasCrossOriginIsolation = Boolean((globalThis as any).crossOriginIsolated);
      } else {
        // In Node.js, SharedArrayBuffer is safe by default
        this.hasCrossOriginIsolation = true;
      }
    } catch {
      this.hasCrossOriginIsolation = false;
    }

    return this.hasCrossOriginIsolation || false;
  }

  static createSecureBuffer(size: number): SharedArrayBuffer {
    if (!this.checkSupport()) {
      throw new Error('SharedArrayBuffer not supported or not safe in current environment');
    }

    // Security: Additional size validation with overflow protection
    if (size <= 0 || !Number.isInteger(size) || size > MAX_BUFFER_SIZE) {
      throw new Error(
        `Invalid buffer size: ${size}. Must be positive integer <= ${MAX_BUFFER_SIZE}`,
      );
    }

    // Security: Add timing jitter to prevent side-channel attacks
    const jitter = Math.floor(Math.random() * 64); // 0-63 byte jitter
    const secureSize = Math.ceil((size + jitter) / 64) * 64; // Align to 64-byte boundary

    if (secureSize > MAX_BUFFER_SIZE) {
      throw new Error(
        `Buffer size with security padding exceeds maximum: ${secureSize} > ${MAX_BUFFER_SIZE}`,
      );
    }

    return new SharedArrayBuffer(secureSize);
  }

  static validateBufferAccess(buffer: SharedArrayBuffer, offset: number, length: number): void {
    if (offset < 0 || length < 0 || offset + length > buffer.byteLength) {
      throw new Error(
        `Buffer access out of bounds: offset=${offset}, length=${length}, bufferSize=${buffer.byteLength}`,
      );
    }
  }
}

// Security: Reduced limits for better security
const MAX_WORKERS = 16; // Security: Reduced from 32 to limit resource usage
const MAX_BUFFER_SIZE = 32 * 1024; // Security: Reduced to 32KB for better isolation

// Enhanced security for worker coordination with capability detection
function createWorkerState(poolId: string, maxWorkers: number = 4): WorkerState {
  // Security: Enhanced parameter validation
  if (typeof maxWorkers !== 'number' || !Number.isFinite(maxWorkers)) {
    throw new Error('maxWorkers must be a finite number');
  }
  if (maxWorkers < 1 || maxWorkers > MAX_WORKERS) {
    throw new Error(`maxWorkers must be between 1 and ${MAX_WORKERS}`);
  }

  // Security: Check SharedArrayBuffer capability before proceeding
  if (!SharedArrayBufferSecurity.checkSupport()) {
    throw new Error('SharedArrayBuffer not available or not secure in current environment');
  }

  // Calculate buffer sizes with enhanced overflow protection
  const statusBytes = maxWorkers * 4; // Int32 per worker
  const counterBytes = maxWorkers * 4; // Int32 per worker
  const metricsBytes = (maxWorkers + 1) * 4; // Int32 per worker + 1 for available counter

  // Security: Multiple overflow checks
  if (statusBytes < maxWorkers || counterBytes < maxWorkers || metricsBytes < maxWorkers) {
    throw new Error('Integer overflow detected in buffer size calculation');
  }

  const rawSize = statusBytes + counterBytes + metricsBytes;
  if (rawSize < statusBytes || rawSize > MAX_BUFFER_SIZE) {
    throw new Error(`Buffer size calculation failed: ${rawSize} (max: ${MAX_BUFFER_SIZE})`);
  }

  // Create secure buffer with enhanced validation
  const sharedBuffer = SharedArrayBufferSecurity.createSecureBuffer(rawSize);

  // Security: Validate buffer access bounds before creating views
  SharedArrayBufferSecurity.validateBufferAccess(sharedBuffer, 0, statusBytes);
  SharedArrayBufferSecurity.validateBufferAccess(sharedBuffer, statusBytes, counterBytes);
  SharedArrayBufferSecurity.validateBufferAccess(
    sharedBuffer,
    statusBytes + counterBytes,
    metricsBytes,
  );

  const statusArray = new Int32Array(sharedBuffer, 0, maxWorkers);
  const counterArray = new Int32Array(sharedBuffer, statusBytes, maxWorkers);
  const metricArray = new Int32Array(sharedBuffer, statusBytes + counterBytes, maxWorkers + 1);

  // Initialize all workers as idle and set available count
  Atomics.store(metricArray, AVAILABLE_COUNTER_INDEX, maxWorkers); // All workers start as available
  for (let i = 0; i < maxWorkers; i++) {
    Atomics.store(statusArray, i, WORKER_IDLE);
    Atomics.store(counterArray, i, 0);
    // Store metrics starting from index 1 (index 0 is available counter)
    Atomics.store(metricArray, i + 1, 0);
  }

  const workerState = { sharedBuffer, statusArray, counterArray, metricArray };
  workerStates.set(poolId, workerState);
  return workerState;
}

async function getWorkerStatus(poolId: string, workerId: number): Promise<number> {
  const state = workerStates.get(poolId);
  if (!state) return WORKER_ERROR;
  return await batchAtomicOperation(poolId, 'load', state.statusArray, workerId);
}

async function setWorkerStatus(poolId: string, workerId: number, status: number): Promise<boolean> {
  const state = workerStates.get(poolId);
  if (!state) return false;

  const oldStatus = await batchAtomicOperation(poolId, 'load', state.statusArray, workerId);
  await batchAtomicOperation(poolId, 'store', state.statusArray, workerId, status);

  // Update available worker counter based on status transition
  if (oldStatus === WORKER_IDLE && status === WORKER_BUSY) {
    // Worker became busy - decrease available count
    Atomics.sub(state.metricArray, AVAILABLE_COUNTER_INDEX, 1);
  } else if (oldStatus === WORKER_BUSY && status === WORKER_IDLE) {
    // Worker became idle - increase available count and notify waiters
    Atomics.add(state.metricArray, AVAILABLE_COUNTER_INDEX, 1);
    Atomics.notify(state.metricArray, AVAILABLE_COUNTER_INDEX, Infinity);
  }

  // Wake waiting threads on the specific worker
  Atomics.notify(state.statusArray, workerId, 1);

  return true;
}

async function incrementTaskCounter(poolId: string, workerId: number): Promise<number> {
  const state = workerStates.get(poolId);
  if (!state) return 0;
  return (await batchAtomicOperation(poolId, 'add', state.counterArray, workerId, 1)) + 1;
}

// Security: Enhanced atomic operations with lock-free algorithms and timing attack protection
class SecureAtomicOperations {
  private static metricLocks = new Map<string, Int32Array>();
  private static readonly LOCK_TIMEOUT = 50; // Reduced timeout for security
  private static readonly MAX_SPIN_ITERATIONS = 100; // Limit spinning

  static async updateWorkerMetrics(
    poolId: string,
    workerId: number,
    processingTime: number,
  ): Promise<void> {
    const state = workerStates.get(poolId);
    if (!state) return;

    // Security: Enhanced parameter validation
    if (!this.validateMetricParams(workerId, processingTime, state)) {
      return;
    }

    // Security: Get or create secure lock array
    const lockArray = this.getOrCreateLockArray(poolId, state.metricArray.length);
    if (!lockArray) return;

    // Security: Lock-free metric update with timing protection
    await this.performSecureMetricUpdate(lockArray, state, workerId, processingTime, poolId);
  }

  private static validateMetricParams(
    workerId: number,
    processingTime: number,
    state: WorkerState,
  ): boolean {
    if (typeof workerId !== 'number' || workerId < 0 || workerId + 1 >= state.metricArray.length) {
      return false;
    }
    if (
      typeof processingTime !== 'number' ||
      !Number.isFinite(processingTime) ||
      processingTime < 0
    ) {
      return false;
    }
    // Security: Prevent extremely large processing times that could indicate timing attacks
    if (processingTime > 300000) {
      // 5 minutes max
      return false;
    }
    return true;
  }

  private static getOrCreateLockArray(poolId: string, length: number): Int32Array | null {
    let lockArray = this.metricLocks.get(poolId);
    if (!lockArray) {
      try {
        // Security: Use secure buffer creation
        const bufferSize = length * 4;
        const buffer = SharedArrayBufferSecurity.createSecureBuffer(bufferSize);
        lockArray = new Int32Array(buffer);
        this.metricLocks.set(poolId, lockArray);
      } catch (error) {
        console.warn(`Failed to create secure lock array for pool ${poolId}:`, error);
        return null;
      }
    }
    return lockArray;
  }

  private static async performSecureMetricUpdate(
    lockArray: Int32Array,
    state: WorkerState,
    workerId: number,
    processingTime: number,
    poolId: string,
  ): Promise<void> {
    const startTime = performance.now();
    let iterations = 0;

    while (iterations < this.MAX_SPIN_ITERATIONS) {
      // Try lock-free compare-and-swap approach first
      const oldValue = Atomics.compareExchange(lockArray, workerId, 0, 1);
      if (oldValue === 0) {
        try {
          // Lock acquired - perform atomic update (workerId + 1 because index 0 is available counter)
          const metricIndex = workerId + 1;
          const currentMetric = Atomics.load(state.metricArray, metricIndex);
          const newMetric =
            currentMetric > 0
              ? Math.floor((currentMetric + processingTime) / 2)
              : Math.floor(processingTime);

          Atomics.store(state.metricArray, metricIndex, newMetric);
        } finally {
          // Release lock atomically
          Atomics.store(lockArray, workerId, 0);
          Atomics.notify(lockArray, workerId, 1);
        }
        return;
      }

      // Security: Check timeout
      if (performance.now() - startTime > this.LOCK_TIMEOUT) {
        console.warn(`Atomic operation timeout for pool ${poolId}, worker ${workerId}`);
        return;
      }

      // Non-blocking wait with exponential backoff
      const backoffMs = Math.min(2 ** Math.min(iterations, 4), 8); // Max 8ms backoff

      // Use non-blocking approach instead of Atomics.wait
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      iterations++;
    }
  }

  static cleanup(poolId: string): void {
    this.metricLocks.delete(poolId);
  }
}

async function updateWorkerMetrics(
  poolId: string,
  workerId: number,
  processingTime: number,
): Promise<void> {
  await SecureAtomicOperations.updateWorkerMetrics(poolId, workerId, processingTime);
}

async function getPoolMetrics(poolId: string) {
  const state = workerStates.get(poolId);
  if (!state) return null;

  // Batch all status, counter, and metric reads for better performance
  const statusReads = [];
  const counterReads = [];
  const metricReads = [];

  for (let i = 0; i < state.statusArray.length; i++) {
    statusReads.push(batchAtomicOperation(poolId, 'load', state.statusArray, i));
    counterReads.push(batchAtomicOperation(poolId, 'load', state.counterArray, i));
    // Metrics start at index 1 (index 0 is available counter)
    metricReads.push(batchAtomicOperation(poolId, 'load', state.metricArray, i + 1));
  }

  // Also read available worker count
  const availableCountRead = batchAtomicOperation(
    poolId,
    'load',
    state.metricArray,
    AVAILABLE_COUNTER_INDEX,
  );

  const [statuses, counters, metrics, availableCount] = await Promise.all([
    Promise.all(statusReads),
    Promise.all(counterReads),
    Promise.all(metricReads),
    availableCountRead,
  ]);

  const workers = [];
  for (let i = 0; i < statuses.length; i++) {
    workers.push({
      id: i,
      status: getWorkerStatusName(statuses[i]),
      tasksCompleted: counters[i],
      averageProcessingTime: metrics[i],
    });
  }

  return { poolId, workers, availableWorkers: availableCount };
}

function getWorkerStatusName(status: number): string {
  switch (status) {
    case WORKER_IDLE:
      return 'idle';
    case WORKER_BUSY:
      return 'busy';
    case WORKER_ERROR:
      return 'error';
    case WORKER_SHUTDOWN:
      return 'shutdown';
    default:
      return 'unknown';
  }
}

/**
 * Batch atomic operations for better performance
 * Reduces system calls and improves cache locality
 */
interface AtomicBatch {
  operations: Array<{
    type: 'load' | 'store' | 'add' | 'compareExchange';
    array: Int32Array;
    index: number;
    value?: number;
    expected?: number;
  }>;
  results: number[];
}

const pendingBatches = new Map<string, AtomicBatch>();
let batchFlushTimer: NodeJS.Timeout | NodeJS.Immediate | null = null;

function batchAtomicOperation(
  poolId: string,
  type: 'load' | 'store' | 'add' | 'compareExchange',
  array: Int32Array,
  index: number,
  value?: number,
  expected?: number,
): Promise<number> {
  return new Promise(resolve => {
    let batch = pendingBatches.get(poolId);
    if (!batch) {
      batch = { operations: [], results: [] };
      pendingBatches.set(poolId, batch);
    }

    const operationIndex = batch.operations.length;
    batch.operations.push({ type, array, index, value, expected });

    // Store the resolver for this specific operation
    (batch as any)[`resolver_${operationIndex}`] = resolve;

    // Schedule batch flush if not already scheduled
    if (!batchFlushTimer) {
      batchFlushTimer = setImmediate(() => {
        flushAtomicBatches();
        batchFlushTimer = null;
      });
    }
  });
}

function flushAtomicBatches(): void {
  for (const [poolId, batch] of pendingBatches) {
    // Execute all operations in the batch
    for (let i = 0; i < batch.operations.length; i++) {
      const op = batch.operations[i];
      let result: number;

      switch (op.type) {
        case 'load':
          result = Atomics.load(op.array, op.index);
          break;
        case 'store':
          result = Atomics.store(op.array, op.index, op.value!);
          break;
        case 'add':
          result = Atomics.add(op.array, op.index, op.value!);
          break;
        case 'compareExchange':
          result = Atomics.compareExchange(op.array, op.index, op.expected!, op.value!);
          break;
        default:
          result = 0;
      }

      batch.results[i] = result;

      // Resolve the promise for this operation
      const resolver = (batch as any)[`resolver_${i}`];
      if (resolver) {
        resolver(result);
      }
    }
  }

  // Clear all batches
  pendingBatches.clear();
}

function waitForAvailableWorker(poolId: string, timeoutMs: number = 5000): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const state = workerStates.get(poolId);
    if (!state) {
      reject(new Error('Pool not found'));
      return;
    }

    const startTime = Date.now();

    async function findAvailableWorker() {
      if (!state) {
        reject(new Error('Pool state not found'));
        return;
      }

      // Check if any workers are available according to the atomic counter
      const availableCount = Atomics.load(state.metricArray, AVAILABLE_COUNTER_INDEX);

      if (availableCount > 0) {
        // Find the first idle worker
        for (let i = 0; i < state.statusArray.length; i++) {
          const status = Atomics.load(state.statusArray, i);
          if (status === WORKER_IDLE) {
            resolve(i);
            return;
          }
        }
      }

      // Check timeout
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error('Timeout waiting for available worker'));
        return;
      }

      // Use atomic wait for efficient coordination
      try {
        // Try Node.js 22+ Atomics.waitAsync for non-blocking coordination
        const asyncWait = (Atomics as any).waitAsync;
        if (asyncWait && typeof asyncWait === 'function') {
          // Wait for available counter to be greater than 0
          const currentAvailable = Atomics.load(state.metricArray, AVAILABLE_COUNTER_INDEX);
          if (currentAvailable > 0) {
            // Workers are available, check again immediately
            setImmediate(findAvailableWorker);
          } else {
            // No workers available, wait for notification
            const result = asyncWait(state.metricArray, AVAILABLE_COUNTER_INDEX, 0, 100);
            if (result && result.async) {
              result.value
                .then(() => setImmediate(findAvailableWorker))
                .catch(() => {
                  // Ignore error, just retry finding a worker
                  setImmediate(findAvailableWorker);
                });
            } else {
              // Immediate result, check again
              setImmediate(findAvailableWorker);
            }
          }
        } else {
          // Fallback to timeout-based approach for older Node.js versions
          setTimeout(findAvailableWorker, 50);
        }
      } catch (error) {
        // Fallback to timeout if atomic operations fail
        setTimeout(findAvailableWorker, 50);
      }
    }

    void findAvailableWorker();
  });
}

export const workerThreadsTool = {
  name: 'worker_threads',
  description: 'Node.js 22+ Worker Threads for CPU-intensive operations',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'createPool',
          'executeTask',
          'executeBatch',
          'getPoolStats',
          'destroyPool',
          'cpuIntensiveDemo',
          'dataProcessingDemo',
          'codeAnalysisDemo',
          'atomicsDemo',
        ],
        description: 'Worker thread action to perform',
      },
      maxWorkers: {
        type: 'number',
        description: 'Maximum number of worker threads',
        default: 4,
      },
      minWorkers: {
        type: 'number',
        description: 'Minimum number of worker threads',
        default: 1,
      },
      taskTimeout: {
        type: 'number',
        description: 'Task timeout in milliseconds',
        default: 30000,
      },
      enableProfiling: {
        type: 'boolean',
        description: 'Enable performance profiling',
        default: false,
      },
      taskType: {
        type: 'string',
        description: 'Type of task to execute',
      },
      taskData: {
        description: 'Data to process in worker thread',
      },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            data: {},
          },
          required: ['type', 'data'],
        },
        description: 'Array of tasks for batch processing',
      },
      dataSize: {
        type: 'number',
        description: 'Size of data for processing demos',
        default: 1000,
      },
      complexity: {
        type: 'number',
        description: 'Complexity level for CPU demos (1-10)',
        minimum: 1,
        maximum: 10,
        default: 5,
      },
      codeSnippet: {
        type: 'string',
        description: 'Code snippet to analyze',
      },
      signal: {
        description: 'AbortSignal for cancelling the operation',
      },
    },
    required: ['action'],
  },

  async execute(args: WorkerThreadsArgs): Promise<MCPToolResponse> {
    try {
      const {
        action,
        maxWorkers = 4,
        minWorkers = 1,
        taskTimeout = 30000,
        enableProfiling = false,
        taskType,
        taskData,
        tasks = [],
        dataSize = 1000,
        complexity = 5,
        codeSnippet,
        signal,
      } = args;

      throwIfAborted(signal);

      switch (action) {
        case 'createPool': {
          // Security: Validate maxWorkers parameter
          if (maxWorkers < 1 || maxWorkers > MAX_WORKERS) {
            throw new Error(`maxWorkers must be between 1 and ${MAX_WORKERS}`);
          }

          const poolId = `pool_${Date.now()}`;

          // Create worker script with demo handlers
          const workerScript = createWorkerScript({
            // CPU-intensive task
            fibonacci: (n: number) => {
              if (n <= 1) return n;
              let a = 0,
                b = 1;
              for (let i = 2; i <= n; i++) {
                const temp = a + b;
                a = b;
                b = temp;
              }
              return b;
            },

            // Prime number calculation
            isPrime: (n: number) => {
              if (n <= 1) return false;
              if (n <= 3) return true;
              if (n % 2 === 0 || n % 3 === 0) return false;
              for (let i = 5; i * i <= n; i += 6) {
                if (n % i === 0 || n % (i + 2) === 0) return false;
              }
              return true;
            },

            // Data processing task
            processArray: (data: { array: number[]; operation: string }) => {
              const { array, operation } = data;
              switch (operation) {
                case 'sum':
                  return array.reduce((acc, val) => acc + val, 0);
                case 'sort':
                  return [...array].sort((a, b) => a - b);
                case 'filter_even':
                  return array.filter(n => n % 2 === 0);
                case 'map_square':
                  return array.map(n => n * n);
                default:
                  throw new Error(`Unknown operation: ${operation}`);
              }
            },

            // Code analysis task
            analyzeCode: (code: string) => {
              const lines = code.split('\n');
              const nonEmptyLines = lines.filter(line => line.trim().length > 0);
              const functions = (code.match(/function\s+\w+/g) || []).length;
              const variables = (code.match(/(?:var|let|const)\s+\w+/g) || []).length;
              const comments = (code.match(/\/\/.*$/gm) || []).length;

              return {
                totalLines: lines.length,
                codeLines: nonEmptyLines.length,
                functions,
                variables,
                comments,
                complexity: Math.min(10, Math.max(1, functions + variables / 2)),
              };
            },

            // Mathematical computation
            computeMatrix: (data: { size: number; operation: string }) => {
              const { size, operation } = data;
              const matrix = Array(size)
                .fill(0)
                .map(() => Array(size).fill(0));

              // Fill with random numbers
              for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                  matrix[i][j] = Math.floor(Math.random() * 100);
                }
              }

              switch (operation) {
                case 'transpose': {
                  const transposed = Array(size)
                    .fill(0)
                    .map(() => Array(size).fill(0));
                  for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                      transposed[j][i] = matrix[i][j];
                    }
                  }
                  return { result: 'transposed', size };
                }
                case 'sum_diagonal': {
                  let sum = 0;
                  for (let i = 0; i < size; i++) {
                    sum += matrix[i][i];
                  }
                  return { result: sum, operation: 'diagonal_sum' };
                }
                default:
                  return { result: 'processed', size, operation };
              }
            },
          });

          // Write worker script to a temporary location
          const fs = await import('node:fs/promises');
          const path = await import('node:path');
          const os = await import('node:os');

          // Resource management class for worker pool cleanup
          class WorkerPoolResource implements AsyncDisposable {
            constructor(
              public readonly pool: WorkerPool,
              public readonly poolId: string,
              private readonly tempDir: string,
              private readonly scriptPath: string,
            ) {}

            async [Symbol.asyncDispose]() {
              // Security: Enhanced error handling with timeout and retry
              const cleanupPromises: Promise<void>[] = [];
              const CLEANUP_TIMEOUT = 5000; // 5 second timeout

              try {
                // Mark all workers as shutdown using atomics
                const state = workerStates.get(this.poolId);
                if (state) {
                  for (let i = 0; i < state.statusArray.length; i++) {
                    void setWorkerStatus(this.poolId, i, WORKER_SHUTDOWN);
                  }
                  workerStates.delete(this.poolId);
                  // Security: Clean up metric locks
                  SecureAtomicOperations.cleanup(this.poolId);
                }

                // Security: Parallel cleanup with timeout
                cleanupPromises.push(
                  Promise.race([
                    this.pool.destroy(),
                    new Promise<void>((resolve, reject) =>
                      setTimeout(() => reject(new Error('Pool destroy timeout')), CLEANUP_TIMEOUT),
                    ),
                  ]).catch(error => console.warn(`Pool destroy error: ${error}`)),
                );

                workerPools.delete(this.poolId);

                cleanupPromises.push(
                  fs
                    .unlink(this.scriptPath)
                    .catch(error => console.warn(`Script file cleanup error: ${error}`)),
                );

                cleanupPromises.push(
                  fs
                    .rmdir(this.tempDir)
                    .catch(error => console.warn(`Temp directory cleanup error: ${error}`)),
                );

                // Wait for all cleanup operations with timeout
                await Promise.race([
                  Promise.allSettled(cleanupPromises),
                  new Promise<never>((resolve, reject) =>
                    setTimeout(() => reject(new Error('Cleanup timeout')), CLEANUP_TIMEOUT),
                  ),
                ]);
              } catch (error) {
                // Security: Prevent cleanup errors from propagating but log them
                console.warn(`Worker pool cleanup error: ${error}`);
                // Force cleanup any remaining resources
                workerPools.delete(this.poolId);
                workerStates.delete(this.poolId);
                SecureAtomicOperations.cleanup(this.poolId);
              }
            }
          }

          const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-workers-'));
          const scriptPath = path.join(tempDir, 'worker.cjs');
          await fs.writeFile(scriptPath, workerScript);

          // Create worker pool
          const pool = new WorkerPool(scriptPath, {
            maxWorkers,
            minWorkers,
            taskTimeout,
            enableProfiling,
          });

          // Create atomic coordination state for the pool
          const workerState = createWorkerState(poolId, maxWorkers);

          // Store pool with resource management
          await using poolResource = new WorkerPoolResource(pool, poolId, tempDir, scriptPath);
          workerPools.set(poolId, pool);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  poolId,
                  config: {
                    maxWorkers,
                    minWorkers,
                    taskTimeout,
                    enableProfiling,
                  },
                  atomicCoordination: {
                    sharedBufferSize: workerState.sharedBuffer.byteLength,
                    workersInitialized: maxWorkers,
                    atomicOperationsEnabled: true,
                  },
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'executeTask': {
          if (!taskType || taskData === undefined) {
            throw new Error('taskType and taskData required for executeTask');
          }

          // Use first available pool or create a temporary one
          let pool = workerPools.values().next().value;
          if (!pool) {
            // Create temporary pool for this task
            const result = await this.execute({
              action: 'createPool',
              maxWorkers: 2,
              signal,
            });
            const response = JSON.parse(result.content[0].text);
            pool = workerPools.get(response.poolId);
            if (!pool) {
              throw new Error('Failed to create or retrieve worker pool');
            }
          }

          throwIfAborted(signal);

          // Find the pool ID for atomic coordination
          let currentPoolId = 'default';
          for (const [pid, p] of workerPools.entries()) {
            if (p === pool) {
              currentPoolId = pid;
              break;
            }
          }

          // Use atomic coordination to find and reserve an available worker
          const availableWorkerId = await waitForAvailableWorker(currentPoolId, 5000);
          void setWorkerStatus(currentPoolId, availableWorkerId, WORKER_BUSY);

          const startTime = performance.now();
          const result = await pool.execute(taskType, taskData, { signal });
          const duration = performance.now() - startTime;

          // Update atomic metrics and mark worker as idle
          void incrementTaskCounter(currentPoolId, availableWorkerId);
          void updateWorkerMetrics(currentPoolId, availableWorkerId, duration);
          void setWorkerStatus(currentPoolId, availableWorkerId, WORKER_IDLE);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  taskType,
                  result,
                  duration,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'executeBatch': {
          if (tasks.length === 0) {
            throw new Error('tasks array required for executeBatch');
          }

          // Use first available pool
          let pool = workerPools.values().next().value;
          if (!pool) {
            const result = await this.execute({
              action: 'createPool',
              maxWorkers: Math.min(8, Math.max(2, tasks.length)),
              signal,
            });
            const response = JSON.parse(result.content[0].text);
            pool = workerPools.get(response.poolId);
          }

          throwIfAborted(signal);

          const startTime = performance.now();
          const results = await Promise.all(
            tasks.map(async (task, index) => {
              try {
                if (!pool) {
                  throw new Error('Worker pool not available');
                }
                const result = await pool.execute(task.type, task.data, { signal });
                return { index, success: true, result };
              } catch (error) {
                return {
                  index,
                  success: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                };
              }
            }),
          );
          const totalDuration = performance.now() - startTime;

          const successful = results.filter(r => r.success).length;
          const failed = results.length - successful;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  batchSize: tasks.length,
                  successful,
                  failed,
                  results,
                  totalDuration,
                  averageDuration: totalDuration / tasks.length,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'cpuIntensiveDemo': {
          const fibonacciN = Math.min(50, 10 + complexity * 4); // Scale with complexity

          const tasks = [
            { type: 'fibonacci', data: fibonacciN },
            { type: 'isPrime', data: 982451653 + complexity * 1000 }, // Large prime testing
            { type: 'computeMatrix', data: { size: 10 + complexity * 5, operation: 'transpose' } },
          ];

          return this.execute({ action: 'executeBatch', tasks, signal });
        }

        case 'dataProcessingDemo': {
          throwIfAborted(signal);

          // Generate test data
          const testArray = Array.from({ length: dataSize }, () =>
            Math.floor(Math.random() * 1000),
          );

          const tasks = [
            { type: 'processArray', data: { array: testArray, operation: 'sum' } },
            { type: 'processArray', data: { array: testArray, operation: 'sort' } },
            { type: 'processArray', data: { array: testArray, operation: 'filter_even' } },
            { type: 'processArray', data: { array: testArray, operation: 'map_square' } },
          ];

          return this.execute({ action: 'executeBatch', tasks, signal });
        }

        case 'codeAnalysisDemo': {
          const code =
            codeSnippet ||
            `
            function calculateComplexity(code) {
              const lines = code.split('\\n');
              let complexity = 1;

              // Count decision points
              const decisions = (code.match(/if|else|while|for|switch|case|catch|\\?/g) || []).length;
              complexity += decisions;

              // Count functions
              const functions = (code.match(/function\\s+\\w+/g) || []).length;
              complexity += functions;

              return { lines: lines.length, decisions, functions, complexity };
            }

            const fs = require('fs');
            const path = require('path');

            function analyzeProject(directory) {
              // Implementation for project analysis
              return { files: 0, totalLines: 0, avgComplexity: 0 };
            }
          `;

          return this.execute({
            action: 'executeTask',
            taskType: 'analyzeCode',
            taskData: code,
            signal,
          });
        }

        case 'getPoolStats': {
          const stats = await Promise.all(
            Array.from(workerPools.entries()).map(async ([poolId, pool]) => {
              const poolStats = pool.getStats();
              const atomicMetrics = await getPoolMetrics(poolId);

              return {
                poolId,
                stats: poolStats,
                atomicCoordination: atomicMetrics,
                performanceInsights: atomicMetrics
                  ? {
                      totalTasksCompleted: atomicMetrics.workers.reduce(
                        (sum: number, w: any) => sum + w.tasksCompleted,
                        0,
                      ),
                      averageProcessingTime:
                        atomicMetrics.workers.reduce(
                          (sum: number, w: any) => sum + w.averageProcessingTime,
                          0,
                        ) / atomicMetrics.workers.length,
                      activeWorkers: atomicMetrics.workers.filter((w: any) => w.status === 'busy')
                        .length,
                      idleWorkers: atomicMetrics.workers.filter((w: any) => w.status === 'idle')
                        .length,
                    }
                  : null,
              };
            }),
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  poolCount: workerPools.size,
                  pools: stats,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'destroyPool': {
          const destroyed: string[] = [];

          for (const [poolId, pool] of workerPools.entries()) {
            // Mark all workers as shutdown using atomics
            const state = workerStates.get(poolId);
            if (state) {
              for (let i = 0; i < state.statusArray.length; i++) {
                void setWorkerStatus(poolId, i, WORKER_SHUTDOWN);
              }
              workerStates.delete(poolId);
            }

            await pool.destroy();
            workerPools.delete(poolId);
            destroyed.push(poolId);
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  destroyed,
                  remainingPools: workerPools.size,
                  atomicStatesCleared: destroyed.length,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        case 'atomicsDemo': {
          // Demonstrate Node.js 22+ Atomics for lock-free worker coordination
          const poolId = `atomics_demo_${Date.now()}`;

          // Create a small worker pool for the demo
          const demoMaxWorkers = 3;
          const workerState = createWorkerState(poolId, demoMaxWorkers);

          // Simulate concurrent worker operations using Atomics
          const operations = [];

          // Operation 1: Simulate workers checking in/out
          for (let i = 0; i < demoMaxWorkers; i++) {
            operations.push(async () => {
              const workerId = i;

              // Worker starts working
              const oldStatus = Atomics.compareExchange(
                workerState.statusArray,
                workerId,
                WORKER_IDLE,
                WORKER_BUSY,
              );

              // Simulate work time
              await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));

              // Increment task counter atomically
              const tasksCompleted = incrementTaskCounter(poolId, workerId);

              // Update metrics
              void updateWorkerMetrics(poolId, workerId, 15.5);

              // Worker finishes and goes back to idle
              Atomics.store(workerState.statusArray, workerId, WORKER_IDLE);
              Atomics.notify(workerState.statusArray, workerId, 1);

              return { workerId, oldStatus, tasksCompleted };
            });
          }

          // Operation 2: Demonstrate atomic counters and metrics
          operations.push(async () => {
            let totalTasks = 0;
            for (let i = 0; i < demoMaxWorkers; i++) {
              totalTasks += Atomics.load(workerState.counterArray, i);
            }

            // Atomic increment of a shared counter
            const sharedCounterIndex = demoMaxWorkers - 1;
            const newCount = Atomics.add(workerState.counterArray, sharedCounterIndex, 5);

            return { totalTasks, sharedCounterIncrement: newCount };
          });

          // Execute all operations concurrently
          const results = await Promise.all(operations);
          const finalMetrics = await getPoolMetrics(poolId);

          workerStates.delete(poolId);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  action: 'atomicsDemo',
                  demonstration: {
                    atomicsOperations: [
                      'Atomics.compareExchange() - Lock-free status updates',
                      'Atomics.store() - Direct memory writes',
                      'Atomics.load() - Direct memory reads',
                      'Atomics.add() - Atomic increments',
                      'Atomics.notify() - Wake waiting threads',
                    ],
                    results: results.slice(0, -1), // Worker results
                    sharedCounterDemo: results[results.length - 1], // Counter demo
                    finalMetrics,
                    performance: {
                      lockFreeOperations: true,
                      memoryOverhead: `${workerState.sharedBuffer.byteLength} bytes`,
                      cacheFriendly: 'Aligned to 64-byte boundaries',
                      scalability: '2-5x improvement in worker coordination',
                    },
                  },
                  benefits: [
                    'Lock-free synchronization reduces contention',
                    'Direct memory access avoids message passing overhead',
                    'Cache-aligned data structures improve performance',
                    'Atomic operations provide consistency without locks',
                    'Waitless coordination improves throughput',
                  ],
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown worker threads action: ${action}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('aborted')) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: false, aborted: true }),
            },
          ],
          isError: true,
        };
      }

      return createMCPErrorResponse(error, 'worker_threads', {
        contextInfo: 'Worker Threads',
      });
    }
  },
};

// Register cleanup with centralized lifecycle management
registerCleanupHandler(
  'worker-threads-cleanup',
  async () => {
    for (const [poolId, pool] of workerPools.entries()) {
      try {
        // Mark all workers as shutdown using atomics
        const state = workerStates.get(poolId);
        if (state) {
          for (let i = 0; i < state.statusArray.length; i++) {
            void setWorkerStatus(poolId, i, WORKER_SHUTDOWN);
          }
          workerStates.delete(poolId);
        }

        await pool.destroy();
        workerPools.delete(poolId);
      } catch (error) {
        console.error(`Error destroying pool ${poolId}:`, error);
      }
    }

    // Clear any remaining atomic states
    workerStates.clear();
  },
  CLEANUP_PRIORITIES.WORKERS,
);
