# Troubleshooting Guide: Common Issues

## Overview

This guide covers common issues when using Node 22+ features in the
`@repo/orchestration` package, with practical solutions and prevention
strategies.

## Node 22+ Feature Issues

### 1. BigInt Serialization Errors

**Problem:**

```typescript
// ❌ ERROR: Do not know how to serialize a BigInt
const timing = {
  duration: process.hrtime.bigint()
};
JSON.stringify(timing); // Throws error
```

**Symptoms:**

- `TypeError: Do not know how to serialize a BigInt`
- JSON serialization failures when using `process.hrtime.bigint()`
- API responses failing when including timing data

**Solution:**

```typescript
// ✅ SOLUTION: Convert BigInt to Number before serialization
const timing = {
  durationNs: Number(process.hrtime.bigint()),
  durationMs: Number(process.hrtime.bigint()) / 1_000_000
};

// Or use a custom replacer
JSON.stringify(timing, (key, value) =>
  typeof value === "bigint" ? Number(value) : value
);

// Or create a utility function
function serializableTimestamp() {
  const hrtime = process.hrtime.bigint();
  return {
    timestampNs: Number(hrtime),
    timestampMs: Number(hrtime) / 1_000_000,
    iso: new Date().toISOString()
  };
}
```

**Prevention:**

```typescript
// Create a custom timing utility
class SerializableTiming {
  static now() {
    const hrtime = process.hrtime.bigint();
    return {
      nanoseconds: Number(hrtime),
      milliseconds: Number(hrtime) / 1_000_000,
      seconds: Number(hrtime) / 1_000_000_000
    };
  }

  static duration(start: ReturnType<typeof SerializableTiming.now>) {
    const end = SerializableTiming.now();
    return {
      nanoseconds: end.nanoseconds - start.nanoseconds,
      milliseconds: end.milliseconds - start.milliseconds,
      seconds: end.seconds - start.seconds
    };
  }
}
```

### 2. structuredClone Limitations

**Problem:**

```typescript
// ❌ ERROR: Functions cannot be cloned
const objectWithFunction = {
  data: "value",
  callback: () => console.log("test")
};
structuredClone(objectWithFunction); // Throws DataCloneError
```

**Symptoms:**

- `DataCloneError: function could not be cloned`
- Errors when cloning objects with functions, symbols, DOM nodes
- Unexpected behavior with complex object hierarchies

**Solution:**

```typescript
// ✅ SOLUTION: Check object compatibility before cloning
function safeStructuredClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch (error) {
    console.warn("structuredClone failed, using fallback:", error.message);
    return jsonCloneFallback(obj);
  }
}

function jsonCloneFallback<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error("JSON clone fallback also failed:", error);
    throw new Error("Object cannot be cloned");
  }
}

// Better: Pre-validate objects
function isStructuredCloneable(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return true;

  // Check for non-cloneable types
  if (typeof obj === "function") return false;
  if (obj instanceof Error) return false;
  if (obj instanceof WeakMap || obj instanceof WeakSet) return false;

  // Check for DOM nodes (in browser environments)
  if (typeof window !== "undefined" && obj instanceof Node) return false;

  // Recursively check object properties
  try {
    for (const value of Object.values(obj)) {
      if (!isStructuredCloneable(value)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Usage
function smartClone<T>(obj: T): T {
  if (isStructuredCloneable(obj)) {
    return structuredClone(obj);
  } else {
    console.warn("Object contains non-cloneable properties, using fallback");
    return jsonCloneFallback(obj);
  }
}
```

**Prevention:**

```typescript
// Create objects with cloning in mind
interface CloneableUserData {
  readonly id: string;
  readonly name: string;
  readonly metadata: Record<string, string | number | boolean>;
  // Avoid functions, DOM nodes, complex objects
}

// Use factory patterns for complex objects
class UserDataFactory {
  static create(data: any): CloneableUserData {
    return {
      id: data.id,
      name: data.name,
      metadata: this.sanitizeMetadata(data.metadata || {})
    };
  }

  private static sanitizeMetadata(
    metadata: any
  ): Record<string, string | number | boolean> {
    const sanitized: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        sanitized[key] = value;
      } else {
        sanitized[key] = String(value);
      }
    }

    return sanitized;
  }
}
```

### 3. Object.hasOwn Browser Compatibility

**Problem:**

```typescript
// ❌ ERROR: Object.hasOwn is not a function (older Node versions)
if (Object.hasOwn(obj, "property")) {
  // This fails in Node < 16.9.0
}
```

**Symptoms:**

- `TypeError: Object.hasOwn is not a function`
- Runtime errors in older environments
- Type errors in older TypeScript configurations

**Solution:**

```typescript
// ✅ SOLUTION: Polyfill for older environments
function hasOwnProperty(obj: unknown, prop: string): boolean {
  if (typeof Object.hasOwn === "function") {
    return typeof obj === "object" && obj !== null && Object.hasOwn(obj, prop);
  }

  // Fallback for older environments
  return (
    typeof obj === "object" &&
    obj !== null &&
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

// Or create a utility module
export const ObjectUtils = {
  hasOwn(obj: unknown, prop: string): obj is Record<string, unknown> {
    if (typeof obj !== "object" || obj === null) return false;

    if (typeof Object.hasOwn === "function") {
      return Object.hasOwn(obj, prop);
    }

    return Object.prototype.hasOwnProperty.call(obj, prop);
  },

  safeGet<T>(obj: unknown, prop: string): T | undefined {
    return this.hasOwn(obj, prop) ? (obj as any)[prop] : undefined;
  }
};
```

**Prevention:**

```typescript
// Check Node version at startup
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

if (majorVersion < 22) {
  console.warn(
    `Node.js ${nodeVersion} detected. Consider upgrading to Node.js 22+ for optimal performance.`
  );

  // Initialize polyfills if needed
  if (typeof Object.hasOwn === "undefined") {
    (Object as any).hasOwn = function (obj: any, prop: string) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  }
}
```

### 4. Promise.withResolvers Compatibility

**Problem:**

```typescript
// ❌ ERROR: Promise.withResolvers is not a function
const { promise, resolve, reject } = Promise.withResolvers(); // May not exist
```

**Symptoms:**

- `TypeError: Promise.withResolvers is not a function`
- Runtime errors in environments without latest Promise features
- Build failures with older TypeScript configurations

**Solution:**

```typescript
// ✅ SOLUTION: Feature detection and polyfill
function createPromiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  if (typeof Promise.withResolvers === "function") {
    return Promise.withResolvers<T>();
  }

  // Polyfill implementation
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// Or add to Promise prototype (careful with global modifications)
if (typeof Promise.withResolvers === "undefined") {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}
```

**Prevention:**

```typescript
// Create a consistent Promise utility
export class PromiseUtils {
  static withResolvers<T>() {
    return createPromiseWithResolvers<T>();
  }

  static timeout<T>(ms: number): Promise<T> {
    const { promise, reject } = this.withResolvers<T>();
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    return promise;
  }

  static delay(ms: number): Promise<void> {
    const { promise, resolve } = this.withResolvers<void>();
    setTimeout(resolve, ms);
    return promise;
  }
}
```

## Memory Management Issues

### 5. Memory Leaks with Event Listeners

**Problem:**

```typescript
// ❌ Memory leak: Event listeners not cleaned up
class DataProcessor {
  constructor() {
    process.on("SIGINT", this.handleShutdown.bind(this));
    process.on("SIGTERM", this.handleShutdown.bind(this));
    // Never removed!
  }

  handleShutdown() {
    console.log("Shutting down...");
  }
}
```

**Symptoms:**

- Gradual memory increase over time
- Too many listeners warnings
- Performance degradation
- Process won't exit cleanly

**Solution:**

```typescript
// ✅ SOLUTION: Proper cleanup with AbortController
class DataProcessor {
  private abortController = new AbortController();

  constructor() {
    const { signal } = this.abortController;

    process.on("SIGINT", this.handleShutdown.bind(this), { signal });
    process.on("SIGTERM", this.handleShutdown.bind(this), { signal });
  }

  handleShutdown() {
    console.log("Shutting down...");
    this.cleanup();
  }

  cleanup() {
    this.abortController.abort(); // Removes all listeners
  }
}

// Or manual cleanup tracking
class DataProcessorWithManualCleanup {
  private eventCleanup: Array<() => void> = [];

  constructor() {
    const sigintHandler = this.handleShutdown.bind(this);
    const sigtermHandler = this.handleShutdown.bind(this);

    process.on("SIGINT", sigintHandler);
    process.on("SIGTERM", sigtermHandler);

    // Track for cleanup
    this.eventCleanup.push(
      () => process.off("SIGINT", sigintHandler),
      () => process.off("SIGTERM", sigtermHandler)
    );
  }

  cleanup() {
    this.eventCleanup.forEach((cleanup) => cleanup());
    this.eventCleanup.length = 0;
  }
}
```

### 6. WeakMap Misconceptions

**Problem:**

```typescript
// ❌ Misunderstanding: WeakMap doesn't prevent key garbage collection
const metadata = new WeakMap();
function processData(data: string) {
  const obj = { data }; // Local object
  metadata.set(obj, { processed: true });
  return obj.data.toUpperCase();
  // obj becomes eligible for GC immediately after function returns!
}
```

**Symptoms:**

- Metadata disappearing unexpectedly
- WeakMap entries vanishing
- Inconsistent behavior in tests vs production

**Solution:**

```typescript
// ✅ SOLUTION: Understand WeakMap key lifecycle
class DataProcessor {
  private metadata = new WeakMap<object, any>();
  private processedObjects: object[] = []; // Keep references alive

  processData(input: any): any {
    // Create object that will persist
    const dataObject = {
      originalData: input,
      processed: false,
      timestamp: Date.now()
    };

    // Set metadata
    this.metadata.set(dataObject, {
      processingStarted: Date.now(),
      attempts: 1
    });

    // Keep reference to prevent GC
    this.processedObjects.push(dataObject);

    // Process data
    const result = this.performProcessing(dataObject);

    // Update metadata
    const meta = this.metadata.get(dataObject);
    if (meta) {
      meta.processingCompleted = Date.now();
      meta.duration = meta.processingCompleted - meta.processingStarted;
    }

    return result;
  }

  cleanupOldObjects(maxAge: number = 3600000) {
    // 1 hour
    const cutoff = Date.now() - maxAge;

    this.processedObjects = this.processedObjects.filter((obj) => {
      if ((obj as any).timestamp < cutoff) {
        // Remove reference, allowing GC and WeakMap cleanup
        return false;
      }
      return true;
    });
  }
}
```

### 7. Circular Reference Issues

**Problem:**

```typescript
// ❌ Circular references causing memory issues
const parent = { name: "parent", children: [] as any[] };
const child = { name: "child", parent };
parent.children.push(child);

// This will cause issues with some operations
JSON.stringify(parent); // TypeError: Converting circular structure to JSON
```

**Symptoms:**

- JSON serialization errors
- Stack overflow in recursive functions
- Memory not being freed as expected

**Solution:**

```typescript
// ✅ SOLUTION: Use WeakSet to track visited objects
function safeStringify(obj: any, space?: number): string {
  const seen = new WeakSet();

  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]";
        }
        seen.add(value);
      }
      return value;
    },
    space
  );
}

// Or use structuredClone which handles circular references
function deepCloneWithCircular<T>(obj: T): T {
  return structuredClone(obj); // Handles circular refs automatically
}

// For manual traversal, use WeakSet
function traverseObject(
  obj: any,
  visitor: (value: any, path: string[]) => void
): void {
  const visited = new WeakSet();

  function traverse(current: any, path: string[]): void {
    if (typeof current !== "object" || current === null) {
      visitor(current, path);
      return;
    }

    if (visited.has(current)) {
      visitor("[Circular]", path);
      return;
    }

    visited.add(current);
    visitor(current, path);

    for (const [key, value] of Object.entries(current)) {
      traverse(value, [...path, key]);
    }
  }

  traverse(obj, []);
}
```

## Performance Issues

### 8. High-Resolution Timing Overhead

**Problem:**

```typescript
// ❌ Performance overhead from excessive timing
function processItems(items: any[]) {
  return items.map((item) => {
    const start = process.hrtime.bigint(); // Called millions of times!
    const result = item.value * 2;
    const end = process.hrtime.bigint();
    console.log(`Item processing: ${Number(end - start) / 1_000_000}ms`);
    return result;
  });
}
```

**Symptoms:**

- Performance paradox: timing makes code slower
- High CPU usage from timing operations
- Log spam from frequent timing

**Solution:**

```typescript
// ✅ SOLUTION: Use sampling and batching
class PerformantTiming {
  private samples: number[] = [];
  private sampleRate: number = 0.01; // 1% sampling

  processItems(items: any[]) {
    const batchStart = process.hrtime.bigint();

    const results = items.map((item, index) => {
      let itemStart: bigint | null = null;

      // Only time sampled items
      if (Math.random() < this.sampleRate || index === 0) {
        itemStart = process.hrtime.bigint();
      }

      const result = item.value * 2;

      if (itemStart !== null) {
        const itemEnd = process.hrtime.bigint();
        const duration = Number(itemEnd - itemStart) / 1_000_000;
        this.samples.push(duration);
      }

      return result;
    });

    const batchEnd = process.hrtime.bigint();
    const batchDuration = Number(batchEnd - batchStart) / 1_000_000;

    console.log(
      `Batch processing: ${batchDuration}ms, samples: ${this.samples.length}`
    );

    return results;
  }

  getAverageItemTime(): number {
    return (
      this.samples.reduce((sum, time) => sum + time, 0) / this.samples.length
    );
  }
}
```

### 9. Audit Logging Performance Impact

**Problem:**

```typescript
// ❌ Synchronous audit logging blocking operations
async function handleUserAction(userId: string, action: string) {
  const result = await performAction(action);

  // This blocks the response!
  await AuditUtils.logDataAccess(
    "user_action",
    action,
    "execute",
    userId,
    true,
    { largeContext: generateLargeContext() }
  );

  return result;
}
```

**Symptoms:**

- Slow API response times
- User-facing operations blocked by logging
- High latency spikes

**Solution:**

```typescript
// ✅ SOLUTION: Asynchronous logging with buffering
class AsyncAuditLogger {
  private logQueue: Array<{
    args: any[];
    timestamp: number;
  }> = [];
  private isProcessing = false;

  async logAsync(
    eventType: string,
    resourceId: string,
    operation: string,
    userId: string,
    success: boolean,
    metadata: any = {}
  ): Promise<void> {
    // Add to queue immediately
    this.logQueue.push({
      args: [eventType, resourceId, operation, userId, success, metadata],
      timestamp: Date.now()
    });

    // Process queue asynchronously
    setImmediate(() => this.processQueue());
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;

    try {
      // Process in batches
      while (this.logQueue.length > 0) {
        const batch = this.logQueue.splice(0, 10); // Process 10 at a time

        await Promise.all(
          batch.map(async ({ args }) => {
            try {
              await AuditUtils.logDataAccess(...args);
            } catch (error) {
              console.error("Audit logging failed:", error);
            }
          })
        );
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// Usage
const asyncLogger = new AsyncAuditLogger();

async function handleUserAction(userId: string, action: string) {
  const result = await performAction(action);

  // Non-blocking logging
  asyncLogger.logAsync("user_action", action, "execute", userId, true, {
    result: "success",
    timestamp: Date.now()
  });

  return result; // Return immediately
}
```

## TypeScript Configuration Issues

### 10. Module Resolution Problems

**Problem:**

```typescript
// ❌ ERROR: Cannot find module '@repo/orchestration'
import { globalPerformanceMonitor } from "@repo/orchestration";
// Module resolution fails
```

**Symptoms:**

- TypeScript compilation errors
- Runtime module not found errors
- Inconsistent behavior between development and production

**Solution:**

```typescript
// ✅ SOLUTION: Update tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler", // or "node"
    "allowImportingTsExtensions": true,
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@repo/*": ["packages/*/src", "packages/*"]
    }
  },
  "ts-node": {
    "esm": true
  }
}
```

**Package.json configuration:**

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "types": "./src/index.ts"
    },
    "./client": {
      "import": "./src/client.ts",
      "types": "./src/client.ts"
    },
    "./server": {
      "import": "./src/server.ts",
      "types": "./src/server.ts"
    }
  }
}
```

## Testing Issues

### 11. Vitest with ESM Modules

**Problem:**

```typescript
// ❌ ERR_REQUIRE_ESM: Must use import to load ES module
const { globalPerformanceMonitor } = require("@repo/orchestration");
// Mixing CommonJS and ESM
```

**Symptoms:**

- Test execution failures
- Module import errors
- Inconsistent behavior between test and runtime

**Solution:**

```typescript
// ✅ SOLUTION: Configure Vitest for ESM
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  esbuild: {
    target: 'es2022'
  }
});

// package.json
{
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}

// Test file
import { describe, test, expect } from 'vitest';
import { globalPerformanceMonitor } from '@repo/orchestration';

describe('Performance Monitor', () => {
  test('should start timing', async () => {
    await globalPerformanceMonitor.start();
    const timingId = globalPerformanceMonitor.startTiming('test');
    expect(timingId).toBeDefined();
  });
});
```

## Environment-Specific Issues

### 12. Development vs Production Differences

**Problem:**

```typescript
// ❌ Different behavior in different environments
if (process.env.NODE_ENV === "development") {
  // Enable detailed logging
  console.log("Detailed debug info");
} else {
  // Production might have different timing behavior
}
```

**Symptoms:**

- Tests pass in development but fail in production
- Different performance characteristics
- Memory usage differences

**Solution:**

```typescript
// ✅ SOLUTION: Environment-aware configuration
class EnvironmentConfig {
  static get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }

  static get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  static get isTest(): boolean {
    return process.env.NODE_ENV === "test";
  }

  static getTimingConfig() {
    if (this.isTest) {
      return {
        sampleRate: 1.0, // 100% sampling for tests
        batchSize: 1,
        flushInterval: 0
      };
    }

    if (this.isDevelopment) {
      return {
        sampleRate: 0.1, // 10% sampling for development
        batchSize: 10,
        flushInterval: 1000
      };
    }

    return {
      sampleRate: 0.01, // 1% sampling for production
      batchSize: 100,
      flushInterval: 5000
    };
  }
}
```

## Debugging Tools

### Diagnostic Utilities

```typescript
// Debug helper for Node 22+ features
export class Node22Diagnostics {
  static checkFeatureSupport(): {
    nodeVersion: string;
    features: {
      hrtimeBigint: boolean;
      structuredClone: boolean;
      objectHasOwn: boolean;
      promiseWithResolvers: boolean;
    };
    recommendations: string[];
  } {
    const nodeVersion = process.version;
    const recommendations: string[] = [];

    const features = {
      hrtimeBigint: typeof process.hrtime?.bigint === "function",
      structuredClone: typeof structuredClone === "function",
      objectHasOwn: typeof Object.hasOwn === "function",
      promiseWithResolvers: typeof Promise.withResolvers === "function"
    };

    if (!features.hrtimeBigint) {
      recommendations.push(
        "Upgrade to Node.js 10.7+ for process.hrtime.bigint()"
      );
    }

    if (!features.structuredClone) {
      recommendations.push("Upgrade to Node.js 17+ for structuredClone()");
    }

    if (!features.objectHasOwn) {
      recommendations.push("Upgrade to Node.js 16.9+ for Object.hasOwn()");
    }

    if (!features.promiseWithResolvers) {
      recommendations.push(
        "Upgrade to Node.js 22+ for Promise.withResolvers()"
      );
    }

    return { nodeVersion, features, recommendations };
  }

  static async memoryDiagnostic(): Promise<{
    usage: NodeJS.MemoryUsage;
    recommendations: string[];
  }> {
    const usage = process.memoryUsage();
    const recommendations: string[] = [];

    const heapUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;

    if (heapUsagePercent > 80) {
      recommendations.push(
        "High heap usage detected. Consider memory optimization."
      );
    }

    if (usage.external > 100 * 1024 * 1024) {
      // 100MB
      recommendations.push(
        "High external memory usage. Check for buffer leaks."
      );
    }

    if (usage.arrayBuffers > 50 * 1024 * 1024) {
      // 50MB
      recommendations.push("High ArrayBuffer usage detected.");
    }

    // Force GC if available for accurate measurement
    if (global.gc) {
      const beforeGC = usage.heapUsed;
      global.gc();
      const afterGC = process.memoryUsage().heapUsed;
      const freed = beforeGC - afterGC;

      if (freed > 10 * 1024 * 1024) {
        // 10MB freed
        recommendations.push(
          `GC freed ${(freed / 1024 / 1024).toFixed(1)}MB - possible memory leaks`
        );
      }
    }

    return { usage, recommendations };
  }
}
```

## Prevention Checklist

- [ ] Always convert BigInt to Number before JSON serialization
- [ ] Test object cloneability before using structuredClone()
- [ ] Use feature detection for newer Node.js APIs
- [ ] Implement proper cleanup for event listeners and timers
- [ ] Use WeakMap correctly with persistent key references
- [ ] Handle circular references in data structures
- [ ] Use sampling for high-frequency performance measurements
- [ ] Implement asynchronous audit logging
- [ ] Configure TypeScript and build tools for ESM
- [ ] Test in production-like environments
- [ ] Monitor memory usage and implement alerts
- [ ] Use environment-aware configurations

This troubleshooting guide covers the most common issues encountered when
working with Node 22+ features and provides practical, tested solutions.
