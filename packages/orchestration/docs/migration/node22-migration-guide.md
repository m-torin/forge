# Migration Guide: Node 22+ Features

## Overview

This guide helps you migrate from legacy patterns to modern Node 22+ and ES2023
features in the `@repo/orchestration` package. Follow these patterns for
enhanced performance, safety, and maintainability.

## Quick Migration Checklist

- [ ] Replace `Date.now()` with `process.hrtime.bigint()` for timing
- [ ] Replace `JSON.parse(JSON.stringify())` with `structuredClone()`
- [ ] Replace `obj.hasOwnProperty()` with `Object.hasOwn()`
- [ ] Replace manual promise patterns with `Promise.withResolvers()`
- [ ] Update memory management to use WeakMap patterns
- [ ] Implement streaming with backpressure control
- [ ] Add comprehensive audit logging
- [ ] Enable automatic PII detection and redaction

## 1. High-Resolution Timing Migration

### ❌ Legacy Pattern

```typescript
// Old: Millisecond precision, affected by system clock changes
function measureOperation() {
  const start = Date.now();

  performOperation();

  const duration = Date.now() - start;
  console.log(`Operation took ${duration}ms`);
}

// Old: Performance.now() - better but still limited
function betterMeasureOperation() {
  const start = performance.now();

  performOperation();

  const duration = performance.now() - start;
  console.log(`Operation took ${duration}ms`);
}
```

### ✅ Node 22+ Pattern

```typescript
// New: Nanosecond precision, monotonic clock
import { globalPerformanceMonitor } from "@repo/orchestration";

async function measureOperation() {
  // Method 1: Direct hrtime usage
  const start = process.hrtime.bigint();

  await performOperation();

  const end = process.hrtime.bigint();
  const durationNs = end - start;
  const durationMs = Number(durationNs) / 1_000_000;
  console.log(`Operation took ${durationMs.toFixed(3)}ms`);

  // Method 2: Using performance monitor (recommended)
  const timingId = globalPerformanceMonitor.startTiming("operation-name");
  await performOperation();
  const metrics = globalPerformanceMonitor.endTiming(timingId);
  console.log(`Operation took ${metrics.durationMs}ms`);
}
```

**Migration Steps:**

1. Replace all `Date.now()` timing with `process.hrtime.bigint()`
2. Convert nanoseconds to milliseconds: `Number(ns) / 1_000_000`
3. Use `globalPerformanceMonitor` for centralized timing
4. Update tests to expect higher precision values

## 2. Object Cloning Migration

### ❌ Legacy Pattern

```typescript
// Old: Breaks with complex types, no circular reference support
function cloneObject(obj: any) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    throw new Error("Cannot clone object with circular references");
  }
}

// Old: Custom deep clone implementation
function deepClone(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));

  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}
```

### ✅ Node 22+ Pattern

```typescript
// New: Handles all types, circular references, and complex objects
import { globalMemoryMonitor } from "@repo/orchestration";

function cloneObject<T>(obj: T): T {
  try {
    // structuredClone handles everything automatically
    const cloned = structuredClone(obj);

    // Optional: Track cloned objects for memory monitoring
    if (typeof obj === "object" && obj !== null) {
      globalMemoryMonitor.trackObject(cloned, "cloned_object", {
        originalType: obj.constructor.name,
        clonedAt: new Date(),
        source: "structuredClone"
      });
    }

    return cloned;
  } catch (error) {
    throw new Error(`Failed to clone object: ${error.message}`);
  }
}

// Advanced usage with validation
function safeCloneWithValidation<T>(
  obj: T,
  validator?: (obj: T) => boolean
): T {
  const cloned = structuredClone(obj);

  if (validator && !validator(cloned)) {
    throw new Error("Cloned object failed validation");
  }

  return cloned;
}
```

**Migration Steps:**

1. Replace all `JSON.parse(JSON.stringify())` with `structuredClone()`
2. Remove custom deep clone implementations
3. Update error handling for cloning failures
4. Add memory tracking for large objects
5. Update tests to handle all object types correctly

## 3. Property Access Migration

### ❌ Legacy Pattern

```typescript
// Old: Prototype pollution risk
function hasProperty(obj: any, prop: string): boolean {
  return obj.hasOwnProperty(prop);
}

// Old: Safer but verbose
function saferHasProperty(obj: any, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// Old: Configuration validation
function validateConfig(config: any): boolean {
  return (
    config.hasOwnProperty("apiKey") &&
    config.hasOwnProperty("timeout") &&
    config.hasOwnProperty("retries")
  );
}
```

### ✅ Node 22+ Pattern

```typescript
// New: Safe and clean property checking
function hasProperty(obj: unknown, prop: string): boolean {
  return typeof obj === "object" && obj !== null && Object.hasOwn(obj, prop);
}

// New: Type-safe configuration validation
interface Config {
  apiKey: string;
  timeout: number;
  retries: number;
  enableFeature?: boolean;
}

function validateConfig(config: unknown): config is Config {
  return (
    typeof config === "object" &&
    config !== null &&
    Object.hasOwn(config, "apiKey") &&
    Object.hasOwn(config, "timeout") &&
    Object.hasOwn(config, "retries") &&
    typeof (config as any).apiKey === "string" &&
    typeof (config as any).timeout === "number" &&
    typeof (config as any).retries === "number"
  );
}

// New: Advanced property checking with default values
function getConfigValue<T>(config: unknown, key: string, defaultValue: T): T {
  if (
    typeof config === "object" &&
    config !== null &&
    Object.hasOwn(config, key)
  ) {
    return (config as any)[key] ?? defaultValue;
  }
  return defaultValue;
}
```

**Migration Steps:**

1. Replace all `hasOwnProperty` calls with `Object.hasOwn()`
2. Update validation functions to use type guards
3. Add proper type checking before property access
4. Update tests to verify type safety

## 4. Promise Control Migration

### ❌ Legacy Pattern

```typescript
// Old: Manual promise creation with limited control
function createTimeoutPromise<T>(
  operation: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    operation
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Old: Complex async patterns
class AsyncOperationManager {
  private pendingOperations = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (error: Error) => void;
    }
  >();

  startOperation(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pendingOperations.set(id, { resolve, reject });
    });
  }

  completeOperation(id: string, result: any) {
    const operation = this.pendingOperations.get(id);
    if (operation) {
      operation.resolve(result);
      this.pendingOperations.delete(id);
    }
  }
}
```

### ✅ Node 22+ Pattern

```typescript
// New: External resolver control with Promise.withResolvers()
import { globalTimeoutManager } from "@repo/orchestration";

function createTimeoutPromise<T>(
  operation: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();

  const timeoutId = setTimeout(() => {
    reject(new Error(`Timeout after ${timeoutMs}ms`));
  }, timeoutMs);

  operation
    .then((result) => {
      clearTimeout(timeoutId);
      resolve(result);
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

  return promise;
}

// New: Simplified async operation management
class ModernAsyncOperationManager {
  private pendingOperations = new Map<
    string,
    {
      promise: Promise<any>;
      resolve: (value: any) => void;
      reject: (error: Error) => void;
    }
  >();

  startOperation<T>(id: string): Promise<T> {
    const { promise, resolve, reject } = Promise.withResolvers<T>();
    this.pendingOperations.set(id, { promise, resolve, reject });
    return promise;
  }

  completeOperation(id: string, result: any): void {
    const operation = this.pendingOperations.get(id);
    if (operation) {
      operation.resolve(result);
      this.pendingOperations.delete(id);
    }
  }

  // New: Get promise without creating resolvers
  getOperation(id: string): Promise<any> | undefined {
    return this.pendingOperations.get(id)?.promise;
  }
}

// New: Use centralized timeout manager (recommended)
async function performOperationWithTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  return globalTimeoutManager.wrapWithTimeout(operation, timeoutMs, {
    name: operationName,
    onTimeout: () =>
      console.warn(`${operationName} timed out after ${timeoutMs}ms`)
  });
}
```

**Migration Steps:**

1. Replace manual Promise constructor patterns with `Promise.withResolvers()`
2. Use `globalTimeoutManager` for consistent timeout handling
3. Update async operation managers to use external resolvers
4. Add proper logging for timeout events
5. Update tests to verify timeout behavior

## 5. Memory Management Migration

### ❌ Legacy Pattern

```typescript
// Old: Manual memory tracking with potential memory leaks
class LegacyMemoryTracker {
  private trackedObjects = new Map<
    string,
    {
      object: any;
      metadata: any;
      timestamp: Date;
    }
  >();

  trackObject(id: string, object: any, metadata: any) {
    this.trackedObjects.set(id, {
      object,
      metadata,
      timestamp: new Date()
    });
  }

  untrackObject(id: string) {
    this.trackedObjects.delete(id);
  }

  // Memory leaks: objects never garbage collected!
  getTrackedObject(id: string) {
    return this.trackedObjects.get(id)?.object;
  }
}

// Old: Manual memory monitoring
function checkMemoryUsage() {
  const usage = process.memoryUsage();
  if (usage.heapUsed > 100 * 1024 * 1024) {
    // 100MB
    console.warn("High memory usage detected");
  }
}
```

### ✅ Node 22+ Pattern

```typescript
// New: Automatic memory management with WeakMap
import { globalMemoryMonitor } from "@repo/orchestration";

class ModernMemoryTracker {
  private objectMetadata = new WeakMap<
    object,
    {
      metadata: any;
      timestamp: Date;
    }
  >();

  trackObject(object: object, metadata: any) {
    this.objectMetadata.set(object, {
      metadata,
      timestamp: new Date()
    });

    // Also use global memory monitor for comprehensive tracking
    globalMemoryMonitor.trackObject(object, "user_tracking", metadata);
  }

  getMetadata(object: object) {
    return this.objectMetadata.get(object);
  }

  // No explicit untracking needed - WeakMap handles it automatically
}

// New: Comprehensive memory monitoring
async function performMemoryIntensiveOperation() {
  await globalMemoryMonitor.start();

  const largeData = createLargeDataStructure();

  // Track large objects
  globalMemoryMonitor.trackObject(largeData, "large_processing_data", {
    operation: "data_processing",
    expectedSizeMB: 50
  });

  try {
    const result = await processLargeData(largeData);

    // Check for potential memory leaks
    const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
    if (potentialLeaks.length > 0) {
      console.warn(
        "Potential memory leaks detected:",
        potentialLeaks.map((leak) => ({
          type: leak.type,
          age: Date.now() - leak.timestamp.getTime()
        }))
      );
    }

    return result;
  } finally {
    // Memory monitor automatically cleans up tracked objects
    const metrics = globalMemoryMonitor.getCurrentMetrics();
    console.log("Final memory usage:", metrics?.heapUsed);
  }
}
```

**Migration Steps:**

1. Replace Map-based object tracking with WeakMap
2. Use `globalMemoryMonitor` for comprehensive tracking
3. Remove manual memory cleanup code
4. Add memory leak detection
5. Update tests to verify memory behavior

## 6. Streaming and Backpressure Migration

### ❌ Legacy Pattern

```typescript
// Old: Manual batch processing without backpressure
async function processLargeDataset(data: any[]) {
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => processItem(item))
    );
    results.push(...batchResults);

    // No memory monitoring or backpressure control
  }

  return results;
}

// Old: Simple async iteration
async function processAsyncIterable(iterable: AsyncIterable<any>) {
  const results = [];

  for await (const item of iterable) {
    const result = await processItem(item);
    results.push(result);
  }

  return results;
}
```

### ✅ Node 22+ Pattern

```typescript
// New: Advanced streaming with backpressure control
import {
  StreamUtils,
  createStreamProcessor,
  globalMemoryMonitor
} from "@repo/orchestration";

async function processLargeDataset(data: any[]) {
  // Create stream processor with backpressure control
  const processor = createStreamProcessor(
    async (item) => {
      const startTime = process.hrtime.bigint();
      const result = await processItem(item);
      const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000;

      // Track processing metrics
      return {
        ...result,
        _metadata: {
          processingTimeMs: duration,
          processedAt: new Date()
        }
      };
    },
    {
      concurrency: 10,
      backpressure: {
        memoryThresholdMB: 100,
        pauseOnPressure: true
      }
    }
  );

  // Convert array to async iterable
  const dataStream = StreamUtils.arrayToAsyncIterable(data);

  const results = [];
  let processedCount = 0;

  for await (const result of processor.processStream(dataStream)) {
    results.push(result);
    processedCount++;

    // Periodic memory check
    if (processedCount % 1000 === 0) {
      const memory = globalMemoryMonitor.getCurrentMetrics();
      if (memory && memory.heapUsed > 200 * 1024 * 1024) {
        // 200MB
        console.warn(
          `High memory usage at item ${processedCount}: ${memory.heapUsed / 1024 / 1024}MB`
        );

        // Optional: Force garbage collection in development
        if (global.gc && process.env.NODE_ENV === "development") {
          global.gc();
        }
      }
    }
  }

  return results;
}

// New: Memory-efficient streaming with error handling
async function processStreamWithErrorHandling<T, R>(
  stream: AsyncIterable<T>,
  processor: (item: T) => Promise<R>
): Promise<Array<R | Error>> {
  const streamProcessor = createStreamProcessor(
    async (item: T): Promise<R | Error> => {
      try {
        return await processor(item);
      } catch (error) {
        return error as Error;
      }
    },
    {
      concurrency: 5,
      backpressure: { memoryThresholdMB: 50 }
    }
  );

  const results: Array<R | Error> = [];
  for await (const result of streamProcessor.processStream(stream)) {
    results.push(result);
  }

  return results;
}
```

**Migration Steps:**

1. Replace manual batching with `createStreamProcessor`
2. Add backpressure control for memory management
3. Use `StreamUtils.arrayToAsyncIterable` for array processing
4. Add memory monitoring during streaming
5. Implement proper error handling in streams
6. Update tests to verify streaming behavior

## 7. Audit Logging Migration

### ❌ Legacy Pattern

```typescript
// Old: Simple console logging
function logUserAction(userId: string, action: string, success: boolean) {
  console.log(
    `${new Date().toISOString()} - User ${userId} ${action}: ${success ? "SUCCESS" : "FAILURE"}`
  );
}

// Old: Basic file logging
import fs from "fs";

function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp}: ${message}\n`;
  fs.appendFileSync("app.log", logEntry);
}

// Old: Manual security event logging
function logSecurityEvent(event: string, severity: string, details: any) {
  const logEntry = {
    timestamp: new Date(),
    event,
    severity,
    details
  };
  console.warn("SECURITY:", JSON.stringify(logEntry));
}
```

### ✅ Node 22+ Pattern

```typescript
// New: Comprehensive audit logging with enterprise features
import {
  AuditUtils,
  globalAuditLogger,
  startGlobalAuditLogging
} from "@repo/orchestration";

// Initialize audit logging (do this once at startup)
await startGlobalAuditLogging({
  enableIntegrityChecks: true,
  enablePiiDetection: true,
  enableRealTimeAlerts: true,
  batchSize: 100,
  flushInterval: 5000,
  alertThresholds: {
    highRiskEvents: 10,
    failedAuthentications: 5,
    dataAccessRate: 1000,
    errorRate: 50
  }
});

// New: Structured user action logging
async function logUserAction(
  userId: string,
  action: string,
  success: boolean,
  metadata: Record<string, unknown> = {}
) {
  await AuditUtils.logDataAccess(
    "user_action",
    `${action}-${userId}`,
    "execute",
    userId,
    success,
    {
      action,
      timestamp: new Date().toISOString(),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      sessionDuration: metadata.sessionDuration,
      ...metadata
    }
  );
}

// New: Advanced authentication logging
async function logAuthenticationAttempt(
  userId: string,
  method: "password" | "oauth" | "saml" | "api_key",
  success: boolean,
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    attempts?: number;
    lockoutTriggered?: boolean;
  } = {}
) {
  await AuditUtils.logAuthentication(success, userId, method, {
    ...metadata,
    authenticationFlow: "standard",
    securityChecks: {
      ipValidation: true,
      deviceRecognition: metadata.userAgent ? "enabled" : "disabled",
      rateLimit: "enforced"
    }
  });
}

// New: Comprehensive security event logging
async function logSecurityEvent(
  eventType: string,
  severity: "low" | "medium" | "high" | "critical",
  details: Record<string, unknown> = {},
  threats: string[] = []
) {
  await AuditUtils.logSecurityEvent(eventType, severity, threats, {
    ...details,
    detectedAt: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    investigationRequired: severity === "critical" || severity === "high"
  });
}

// New: Workflow execution logging
async function logWorkflowExecution(
  workflowId: string,
  executionId: string,
  stepId: string | undefined,
  success: boolean,
  duration?: number,
  metadata: Record<string, unknown> = {}
) {
  await AuditUtils.logWorkflowExecution(
    workflowId,
    executionId,
    success,
    duration,
    stepId,
    {
      ...metadata,
      executionContext: {
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage().heapUsed,
        timestamp: new Date().toISOString()
      }
    }
  );
}
```

**Migration Steps:**

1. Replace console.log with structured audit logging
2. Initialize `startGlobalAuditLogging` at application startup
3. Use `AuditUtils` functions for all security-relevant events
4. Add comprehensive metadata to all audit events
5. Configure appropriate alert thresholds for production
6. Update tests to verify audit events are logged correctly

## 8. Error Handling Migration

### ❌ Legacy Pattern

```typescript
// Old: Basic try-catch without context
async function performOperation() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    console.error("Operation failed:", error.message);
    throw error;
  }
}

// Old: Manual retry logic
async function retryOperation(
  operation: () => Promise<any>,
  maxRetries: number
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * i));
    }
  }

  throw lastError;
}
```

### ✅ Node 22+ Pattern

```typescript
// New: Comprehensive error handling with audit logging
import { AuditUtils, globalTimeoutManager } from "@repo/orchestration";

async function performOperation(
  operationName: string,
  context: Record<string, unknown> = {}
): Promise<any> {
  const startTime = process.hrtime.bigint();

  try {
    const result = await globalTimeoutManager.wrapWithTimeout(
      someAsyncOperation(),
      5000, // 5 second timeout
      {
        name: operationName,
        onTimeout: () => {
          console.warn(`${operationName} is taking longer than expected`);
        }
      }
    );

    // Log successful operation
    const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    await AuditUtils.logDataAccess(
      "operation_execution",
      operationName,
      "execute",
      context.userId as string,
      true,
      {
        ...context,
        durationMs: duration,
        operationType: "async_operation"
      }
    );

    return result;
  } catch (error) {
    const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    const err = error as Error;

    // Log failed operation with full context
    await AuditUtils.logSecurityEvent(
      `Operation failed: ${operationName}`,
      "medium",
      ["operation_failure"],
      {
        ...context,
        errorMessage: err.message,
        errorStack: err.stack,
        durationMs: duration,
        operationType: "async_operation",
        failureReason: "exception"
      }
    );

    throw new Error(`${operationName} failed: ${err.message}`, { cause: err });
  }
}

// New: Advanced retry with exponential backoff and audit logging
async function retryOperationWithAudit<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  context: Record<string, unknown> = {}
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = process.hrtime.bigint();

    try {
      const result = await operation();

      // Log successful retry if not first attempt
      if (attempt > 1) {
        const duration =
          Number(process.hrtime.bigint() - startTime) / 1_000_000;
        await AuditUtils.logDataAccess(
          "retry_success",
          operationName,
          "execute",
          context.userId as string,
          true,
          {
            ...context,
            attempt,
            maxRetries,
            durationMs: duration,
            previousFailures: attempt - 1
          }
        );
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000;

      // Log failed attempt
      await AuditUtils.logSecurityEvent(
        `Retry attempt ${attempt} failed: ${operationName}`,
        attempt === maxRetries ? "high" : "medium",
        ["retry_failure", "operation_failure"],
        {
          ...context,
          attempt,
          maxRetries,
          errorMessage: lastError.message,
          durationMs: duration,
          willRetry: attempt < maxRetries,
          nextRetryDelayMs:
            attempt < maxRetries ? baseDelayMs * Math.pow(2, attempt - 1) : null
        }
      );

      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.1 * delay;
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      }
    }
  }

  // Log final failure
  await AuditUtils.logSecurityEvent(
    `All retry attempts exhausted: ${operationName}`,
    "critical",
    ["retry_exhausted", "operation_failure"],
    {
      ...context,
      totalAttempts: maxRetries,
      finalError: lastError.message,
      operationName
    }
  );

  throw new Error(
    `${operationName} failed after ${maxRetries} attempts: ${lastError.message}`,
    { cause: lastError }
  );
}
```

**Migration Steps:**

1. Add comprehensive error context to all try-catch blocks
2. Use `globalTimeoutManager` for timeout handling
3. Log all errors as security events with proper severity
4. Implement exponential backoff with jitter for retries
5. Add proper error chaining with `cause` property
6. Update tests to verify error logging behavior

## 9. Testing Migration

### ❌ Legacy Pattern

```typescript
// Old: Basic timing tests
describe("Performance Tests", () => {
  test("operation should complete quickly", async () => {
    const start = Date.now();
    await performOperation();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // 1 second
  });
});

// Old: Simple object tests
describe("Object Tests", () => {
  test("should clone object", () => {
    const original = { a: 1, b: 2 };
    const cloned = JSON.parse(JSON.stringify(original));

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });
});
```

### ✅ Node 22+ Pattern

```typescript
// New: High-precision timing tests
import { describe, test, expect, beforeEach } from "vitest";
import {
  globalPerformanceMonitor,
  globalMemoryMonitor,
  startGlobalAuditLogging
} from "@repo/orchestration";

describe("Performance Tests with Node 22+", () => {
  beforeEach(async () => {
    await globalPerformanceMonitor.start();
    await globalMemoryMonitor.start();
  });

  test("operation should complete with nanosecond precision timing", async () => {
    const startTime = process.hrtime.bigint();

    const timingId = globalPerformanceMonitor.startTiming("test-operation");
    await performOperation();
    const metrics = globalPerformanceMonitor.endTiming(timingId);

    const endTime = process.hrtime.bigint();
    const preciseMs = Number(endTime - startTime) / 1_000_000;

    expect(metrics).toBeDefined();
    expect(metrics!.durationMs).toBeCloseTo(preciseMs, 1); // Within 1ms
    expect(metrics!.durationMs).toBeLessThan(1000);
  });

  test("should handle high-frequency operations", async () => {
    const operations = Array.from({ length: 1000 }, (_, i) =>
      globalPerformanceMonitor.startTiming(`rapid-op-${i}`)
    );

    // End all timings quickly
    const results = operations.map((id) =>
      globalPerformanceMonitor.endTiming(id)
    );

    expect(results.every((r) => r !== null)).toBe(true);
    expect(results.every((r) => r!.durationMs < 10)).toBe(true); // All under 10ms
  });
});

// New: Advanced object cloning tests
describe("Object Cloning with Node 22+", () => {
  test("should clone complex objects with structuredClone", () => {
    const complex = {
      date: new Date("2024-01-01"),
      buffer: new ArrayBuffer(10),
      map: new Map([["key", "value"]]),
      set: new Set([1, 2, 3]),
      nested: { deep: { value: "test" } }
    };

    const cloned = structuredClone(complex);

    expect(cloned).toEqual(complex);
    expect(cloned).not.toBe(complex);
    expect(cloned.date).toBeInstanceOf(Date);
    expect(cloned.buffer).toBeInstanceOf(ArrayBuffer);
    expect(cloned.map).toBeInstanceOf(Map);
    expect(cloned.set).toBeInstanceOf(Set);
  });

  test("should handle circular references", () => {
    const circular: any = { name: "test" };
    circular.self = circular;
    circular.nested = { parent: circular };

    const cloned = structuredClone(circular);

    expect(cloned.name).toBe("test");
    expect(cloned.self).toBe(cloned);
    expect(cloned.nested.parent).toBe(cloned);
  });

  test("should track memory usage during cloning", async () => {
    const largeObject = {
      data: Array.from({ length: 10000 }, (_, i) => ({
        index: i,
        data: "x".repeat(100)
      }))
    };

    const beforeMemory = globalMemoryMonitor.getCurrentMetrics();

    globalMemoryMonitor.trackObject(largeObject, "test_original", {
      size: "large"
    });
    const cloned = structuredClone(largeObject);
    globalMemoryMonitor.trackObject(cloned, "test_cloned", { size: "large" });

    const afterMemory = globalMemoryMonitor.getCurrentMetrics();

    expect(beforeMemory).toBeDefined();
    expect(afterMemory).toBeDefined();
    if (beforeMemory && afterMemory) {
      expect(afterMemory.heapUsed).toBeGreaterThan(beforeMemory.heapUsed);
    }
  });
});

// New: Promise.withResolvers tests
describe("Promise Control with Node 22+", () => {
  test("should use Promise.withResolvers for external control", async () => {
    const { promise, resolve, reject } = Promise.withResolvers<string>();

    // External control of resolution
    setTimeout(() => resolve("success"), 50);

    const result = await promise;
    expect(result).toBe("success");
  });

  test("should handle timeout with Promise.withResolvers", async () => {
    const { promise, resolve, reject } = Promise.withResolvers<string>();

    const timeoutId = setTimeout(() => {
      reject(new Error("Operation timed out"));
    }, 100);

    // Simulate long operation
    setTimeout(() => {
      clearTimeout(timeoutId);
      resolve("completed");
    }, 200);

    await expect(promise).rejects.toThrow("Operation timed out");
  });
});

// New: Audit logging tests
describe("Audit Logging Integration", () => {
  beforeEach(async () => {
    await startGlobalAuditLogging({
      enableIntegrityChecks: false, // Disable for test performance
      enablePiiDetection: false,
      enableRealTimeAlerts: false,
      batchSize: 1000,
      flushInterval: 10000
    });
  });

  test("should log with proper Node 22+ timing", async () => {
    const startTime = process.hrtime.bigint();

    await AuditUtils.logDataAccess(
      "test_operation",
      "test-resource",
      "read",
      "test-user",
      true,
      { testMetadata: "value" }
    );

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    expect(durationMs).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(100); // Should be very fast
  });
});
```

**Migration Steps:**

1. Update timing tests to use `process.hrtime.bigint()`
2. Add `globalPerformanceMonitor` and `globalMemoryMonitor` to test setup
3. Test complex object cloning with `structuredClone()`
4. Add memory usage verification to tests
5. Test `Promise.withResolvers()` patterns
6. Verify audit logging integration in tests
7. Update test assertions for higher precision values

## Common Migration Pitfalls

### 1. **BigInt Precision Loss**

```typescript
// ❌ Wrong: Loses precision
const duration = process.hrtime.bigint() / 1000000n; // Still BigInt!

// ✅ Correct: Convert to Number first
const duration = Number(process.hrtime.bigint()) / 1_000_000;
```

### 2. **structuredClone Limitations**

```typescript
// ❌ Won't work: Functions, symbols, DOM nodes
const withFunction = { fn: () => "test" };
// const cloned = structuredClone(withFunction); // Throws error!

// ✅ Check before cloning
function safeClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    // Fallback for non-cloneable objects
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}
```

### 3. **Object.hasOwn Type Guards**

```typescript
// ❌ Wrong: Doesn't narrow types
if (Object.hasOwn(obj, "prop")) {
  // obj.prop might still be undefined!
}

// ✅ Correct: Full type checking
function hasStringProp(
  obj: unknown,
  prop: string
): obj is Record<string, string> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    Object.hasOwn(obj, prop) &&
    typeof (obj as any)[prop] === "string"
  );
}
```

## Next Steps

1. **Start with timing**: Replace `Date.now()` with `process.hrtime.bigint()` in
   performance-critical code
2. **Update cloning**: Replace `JSON.parse(JSON.stringify())` with
   `structuredClone()`
3. **Fix property access**: Replace `hasOwnProperty` with `Object.hasOwn()`
4. **Modernize promises**: Use `Promise.withResolvers()` for complex async
   patterns
5. **Add monitoring**: Integrate performance and memory monitoring
6. **Enable audit logging**: Add comprehensive audit trails
7. **Update tests**: Verify all new patterns work correctly

For specific implementation examples, see the [Usage Examples](../examples/)
directory.
