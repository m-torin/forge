# Migration Guide: Legacy Patterns to Node 22+ Features

## Overview

This guide provides step-by-step instructions for migrating from legacy
JavaScript patterns to modern Node.js 22+ and ES2023 features in the
`@repo/orchestration` package.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Timing and Performance](#timing-and-performance)
3. [Object Cloning and Manipulation](#object-cloning-and-manipulation)
4. [Promise Management](#promise-management)
5. [Memory Management](#memory-management)
6. [Error Handling](#error-handling)
7. [Security Patterns](#security-patterns)
8. [Testing Patterns](#testing-patterns)
9. [Common Pitfalls](#common-pitfalls)
10. [Validation Checklist](#validation-checklist)

## Prerequisites

### Node.js Version Requirements

```bash
# Ensure you're using Node.js 22+
node --version # Should be v22.0.0 or higher
```

### TypeScript Configuration

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "strict": true
  }
}
```

### Package Dependencies

```json
{
  "engines": {
    "node": ">=22.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.4.0"
  }
}
```

## Timing and Performance

### Legacy Pattern: Date-based Timing

```typescript
// ❌ OLD: Millisecond precision, affected by system clock
function measurePerformance() {
  const start = Date.now();

  // Some operation
  performOperation();

  const duration = Date.now() - start;
  console.log(`Operation took ${duration}ms`);
}

// ❌ OLD: Using performance.now() but without integration
function betterTiming() {
  const start = performance.now();
  performOperation();
  const duration = performance.now() - start;
  return duration;
}
```

### Modern Pattern: High-Resolution Timing

```typescript
// ✅ NEW: Nanosecond precision with process.hrtime.bigint()
function measurePerformanceModern() {
  const start = process.hrtime.bigint();

  performOperation();

  const end = process.hrtime.bigint();
  const durationNs = end - start;
  const durationMs = Number(durationNs) / 1_000_000;

  console.log(`Operation took ${durationMs}ms (${durationNs}ns)`);
  return { durationMs, durationNs };
}

// ✅ NEW: Integrated with monitoring system
import { globalPerformanceMonitor } from "@repo/orchestration";

async function integratedTiming() {
  const timingId = globalPerformanceMonitor.startTiming("my-operation");

  await performAsyncOperation();

  const metrics = globalPerformanceMonitor.endTiming(timingId);
  console.log(
    `Operation: ${metrics.operation}, Duration: ${metrics.durationMs}ms`
  );

  return metrics;
}
```

### Migration Steps

1. **Replace `Date.now()` with `process.hrtime.bigint()`**:

   ```typescript
   // Before
   const start = Date.now();

   // After
   const start = process.hrtime.bigint();
   ```

2. **Update duration calculations**:

   ```typescript
   // Before
   const duration = Date.now() - start;

   // After
   const durationNs = process.hrtime.bigint() - start;
   const durationMs = Number(durationNs) / 1_000_000;
   ```

3. **Integrate with monitoring**:

   ```typescript
   // Before
   function timedFunction() {
     const start = Date.now();
     const result = doWork();
     console.log("Duration:", Date.now() - start);
     return result;
   }

   // After
   async function timedFunction() {
     const timingId = globalPerformanceMonitor.startTiming("doWork");
     const result = await doWork();
     const metrics = globalPerformanceMonitor.endTiming(timingId);
     return { result, metrics };
   }
   ```

## Object Cloning and Manipulation

### Legacy Pattern: JSON-based Cloning

```typescript
// ❌ OLD: Breaks with dates, functions, circular refs
function cloneObject(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

// ❌ OLD: Manual deep cloning with recursion
function deepClone(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;

  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));

  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // ❌ Prototype pollution risk
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}
```

### Modern Pattern: Structured Cloning

```typescript
// ✅ NEW: Safe, handles all types and circular references
function cloneObjectModern<T>(obj: T): T {
  return structuredClone(obj);
}

// ✅ NEW: With error handling and fallback
function safeClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch (error) {
    console.warn("structuredClone failed, falling back to JSON method:", error);
    return JSON.parse(JSON.stringify(obj));
  }
}

// ✅ NEW: Integrated with memory monitoring
import { globalMemoryMonitor } from "@repo/orchestration";

function cloneWithTracking<T>(obj: T, type: string): T {
  const cloned = structuredClone(obj);

  // Track the cloned object for memory monitoring
  globalMemoryMonitor.trackObject(cloned, type, {
    clonedAt: new Date(),
    originalSize: JSON.stringify(obj).length
  });

  return cloned;
}
```

### Property Access Migration

```typescript
// ❌ OLD: Prototype pollution risk
if (obj.hasOwnProperty("property")) {
  // ...
}

// ❌ OLD: Verbose but safe
if (Object.prototype.hasOwnProperty.call(obj, "property")) {
  // ...
}

// ✅ NEW: Clean and safe
if (Object.hasOwn(obj, "property")) {
  // ...
}
```

### Migration Steps

1. **Replace JSON cloning**:

   ```typescript
   // Before
   const cloned = JSON.parse(JSON.stringify(original));

   // After
   const cloned = structuredClone(original);
   ```

2. **Update property checks**:

   ```typescript
   // Before
   if (obj.hasOwnProperty(key)) {
   }

   // After
   if (Object.hasOwn(obj, key)) {
   }
   ```

3. **Handle complex objects**:

   ```typescript
   // Before: Fails with ArrayBuffer, Date, etc.
   const data = {
     buffer: new ArrayBuffer(10),
     date: new Date(),
     map: new Map([["key", "value"]])
   };
   const broken = JSON.parse(JSON.stringify(data));

   // After: Works perfectly
   const working = structuredClone(data);
   ```

## Promise Management

### Legacy Pattern: Manual Promise Construction

```typescript
// ❌ OLD: No external control over resolve/reject
function createTimeout(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ❌ OLD: Complex timeout handling
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    })
  ]);
}
```

### Modern Pattern: Promise.withResolvers()

```typescript
// ✅ NEW: External resolver control
function createControllableTimeout(ms: number) {
  const { promise, resolve, reject } = Promise.withResolvers<void>();

  const timeoutId = setTimeout(resolve, ms);

  return {
    promise,
    cancel: () => {
      clearTimeout(timeoutId);
      reject(new Error("Cancelled"));
    }
  };
}

// ✅ NEW: Clean timeout implementation
function withTimeoutModern<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const { promise: timeoutPromise, reject } = Promise.withResolvers<T>();

  const timeoutId = setTimeout(() => {
    reject(new Error(`Operation timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise
  ]);
}

// ✅ NEW: Integrated with timeout manager
import { globalTimeoutManager } from "@repo/orchestration";

async function managedTimeout<T>(operation: Promise<T>, timeoutMs: number) {
  return globalTimeoutManager.wrapWithTimeout(operation, timeoutMs, {
    name: "my-operation",
    onTimeout: () => console.log("Operation timed out")
  });
}
```

### Migration Steps

1. **Identify external resolver needs**:

   ```typescript
   // Before: Hard to control externally
   let externalResolve: (value: string) => void;
   const promise = new Promise<string>((resolve) => {
     externalResolve = resolve;
   });

   // After: Clean external control
   const { promise, resolve } = Promise.withResolvers<string>();
   ```

2. **Simplify timeout patterns**:

   ```typescript
   // Before
   function raceWithTimeout<T>(operation: Promise<T>, ms: number): Promise<T> {
     return Promise.race([
       operation,
       new Promise<T>((_, reject) =>
         setTimeout(() => reject(new Error("Timeout")), ms)
       )
     ]);
   }

   // After
   function raceWithTimeout<T>(operation: Promise<T>, ms: number): Promise<T> {
     const { promise, reject } = Promise.withResolvers<T>();
     const timeoutId = setTimeout(() => reject(new Error("Timeout")), ms);

     return Promise.race([
       operation.finally(() => clearTimeout(timeoutId)),
       promise
     ]);
   }
   ```

## Memory Management

### Legacy Pattern: Manual Cleanup

```typescript
// ❌ OLD: Manual cleanup, prone to leaks
class DataManager {
  private cache = new Map<string, any>();
  private timers = new Set<NodeJS.Timeout>();

  store(key: string, value: any) {
    this.cache.set(key, value);

    // Manual cleanup after 1 hour
    const timer = setTimeout(() => {
      this.cache.delete(key);
    }, 3600000);

    this.timers.add(timer);
  }

  // Must remember to call this!
  destroy() {
    this.cache.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}
```

### Modern Pattern: Automatic Memory Management

```typescript
// ✅ NEW: WeakMap for automatic garbage collection
class ModernDataManager {
  private cache = new WeakMap<object, any>();

  store(keyObject: object, value: any) {
    // Automatically cleaned up when keyObject is garbage collected
    this.cache.set(keyObject, value);
  }

  get(keyObject: object) {
    return this.cache.get(keyObject);
  }

  // No manual cleanup needed!
}

// ✅ NEW: Integrated memory monitoring
import { globalMemoryMonitor } from "@repo/orchestration";

class MonitoredDataManager {
  async storeWithMonitoring(key: string, data: any, type: string) {
    // Track object for memory monitoring
    globalMemoryMonitor.trackObject(data, type, {
      key,
      createdAt: new Date(),
      estimatedSize: JSON.stringify(data).length
    });

    // Store data
    return this.store(key, data);
  }

  async checkForLeaks() {
    const leaks = globalMemoryMonitor.getPotentialLeaks();
    if (leaks.length > 0) {
      console.warn(`Detected ${leaks.length} potential memory leaks`);
      return leaks;
    }
    return [];
  }
}
```

### Migration Steps

1. **Replace Maps with WeakMaps where appropriate**:

   ```typescript
   // Before: Manual cleanup required
   const metadata = new Map<object, Metadata>();

   // After: Automatic cleanup
   const metadata = new WeakMap<object, Metadata>();
   ```

2. **Add memory monitoring**:

   ```typescript
   // Before: No visibility into memory usage
   function createLargeObject() {
     return new Array(1000000).fill("data");
   }

   // After: Monitored memory usage
   function createLargeObject() {
     const obj = new Array(1000000).fill("data");
     globalMemoryMonitor.trackObject(obj, "large_array", {
       size: obj.length,
       createdAt: new Date()
     });
     return obj;
   }
   ```

## Error Handling

### Legacy Pattern: Basic Try-Catch

```typescript
// ❌ OLD: No context, poor observability
async function processData(data: any) {
  try {
    return await transform(data);
  } catch (error) {
    console.error("Processing failed:", error);
    throw error;
  }
}

// ❌ OLD: No retry logic
async function fetchWithRetry(url: string, retries: number = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Modern Pattern: Enhanced Error Handling

```typescript
// ✅ NEW: Rich error context with audit logging
import { AuditUtils } from "@repo/orchestration";

async function processDataModern(data: any, userId?: string) {
  const startTime = process.hrtime.bigint();

  try {
    const result = await transform(data);

    // Log successful processing
    await AuditUtils.logDataAccess(
      "data_processing",
      `process-${Date.now()}`,
      "update",
      userId,
      true,
      {
        processingTime: Number(process.hrtime.bigint() - startTime) / 1_000_000,
        dataSize: JSON.stringify(data).length
      }
    );

    return result;
  } catch (error) {
    // Log processing failure with context
    await AuditUtils.logSecurityEvent(
      "Data processing failed",
      "high",
      ["processing_error", "data_integrity"],
      {
        error: (error as Error).message,
        stack: (error as Error).stack,
        userId,
        dataPreview: JSON.stringify(data).substring(0, 100),
        processingTime: Number(process.hrtime.bigint() - startTime) / 1_000_000
      }
    );

    throw error;
  }
}

// ✅ NEW: Sophisticated retry with exponential backoff
async function fetchWithRetryModern<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    backoffFactor = 2
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();

      if (attempt > 1) {
        await AuditUtils.logDataAccess(
          "retry_success",
          `retry-${attempt}`,
          "execute",
          "system",
          true,
          { attempt, maxRetries, previousFailures: attempt - 1 }
        );
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      await AuditUtils.logSecurityEvent(
        `Operation failed on attempt ${attempt}`,
        attempt === maxRetries ? "high" : "medium",
        ["operation_failure", "retry_attempt"],
        {
          attempt,
          maxRetries,
          error: lastError.message,
          willRetry: attempt < maxRetries
        }
      );

      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelayMs * Math.pow(backoffFactor, attempt - 1),
          maxDelayMs
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

### Migration Steps

1. **Add error context**:

   ```typescript
   // Before
   catch (error) {
     console.error(error);
   }

   // After
   catch (error) {
     await AuditUtils.logSecurityEvent(
       'Operation failed',
       'high',
       ['error'],
       {
         error: (error as Error).message,
         context: 'user_operation',
         timestamp: new Date().toISOString()
       }
     );
   }
   ```

2. **Implement proper retry logic**:

   ```typescript
   // Before: Simple retry
   for (let i = 0; i < 3; i++) {
     try {
       return await operation();
     } catch (e) {
       if (i === 2) throw e;
     }
   }

   // After: Sophisticated retry
   return await fetchWithRetryModern(operation, {
     maxRetries: 3,
     baseDelayMs: 1000,
     backoffFactor: 2
   });
   ```

## Security Patterns

### Legacy Pattern: Basic Validation

```typescript
// ❌ OLD: No PII protection, basic validation
function processUserData(userData: any) {
  console.log("Processing user data:", userData); // Might log PII!

  if (!userData.email || !userData.name) {
    throw new Error("Missing required fields");
  }

  return { success: true };
}
```

### Modern Pattern: Secure Processing

```typescript
// ✅ NEW: PII protection, comprehensive audit logging
import { AuditUtils, DataMaskingUtils } from "@repo/orchestration";

async function processUserDataModern(userData: any, userId: string) {
  // Mask PII for logging
  const maskedData = DataMaskingUtils.maskPII(userData);

  try {
    // Validate required fields safely
    const requiredFields = ["email", "name"];
    const missingFields = requiredFields.filter(
      (field) => !Object.hasOwn(userData, field)
    );

    if (missingFields.length > 0) {
      await AuditUtils.logSecurityEvent(
        "User data validation failed",
        "medium",
        ["validation_error", "data_integrity"],
        {
          missingFields,
          userId,
          dataPreview: maskedData
        }
      );
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Process data
    const result = await processData(userData);

    // Log successful processing (with masked data)
    await AuditUtils.logDataAccess(
      "user_data",
      `user-${userId}`,
      "update",
      userId,
      true,
      {
        processedFields: Object.keys(userData),
        maskedData
      }
    );

    return result;
  } catch (error) {
    await AuditUtils.logSecurityEvent(
      "User data processing failed",
      "high",
      ["processing_error", "user_data"],
      {
        error: (error as Error).message,
        userId,
        maskedData
      }
    );
    throw error;
  }
}
```

### Cryptographic Integrity

```typescript
// ✅ NEW: Data integrity verification
import { createHash, timingSafeEqual } from "crypto";

function createDataWithIntegrity<T>(data: T): T & { _integrity: string } {
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  const checksum = createHash("sha256").update(dataString).digest("hex");

  return {
    ...data,
    _integrity: checksum
  };
}

function verifyDataIntegrity<T>(
  dataWithIntegrity: T & { _integrity: string }
): T {
  const { _integrity: checksum, ...data } = dataWithIntegrity;
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  const expectedChecksum = createHash("sha256")
    .update(dataString)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  const checksumBuffer = Buffer.from(checksum, "hex");
  const expectedBuffer = Buffer.from(expectedChecksum, "hex");

  if (
    checksumBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(checksumBuffer, expectedBuffer)
  ) {
    throw new Error("Data integrity check failed");
  }

  return data;
}
```

## Testing Patterns

### Legacy Pattern: Basic Jest Tests

```typescript
// ❌ OLD: Simple timing, no Node 22+ features
describe("Performance Tests", () => {
  test("should complete operation quickly", async () => {
    const start = Date.now();
    await operation();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

### Modern Pattern: Node 22+ Testing

```typescript
// ✅ NEW: High-resolution timing, Node 22+ features
import { describe, test, expect, beforeEach } from "vitest";

describe("Modern Performance Tests", () => {
  beforeEach(() => {
    // Reset monitoring systems
    globalPerformanceMonitor.reset?.();
  });

  test("should use high-resolution timing", async () => {
    const start = process.hrtime.bigint();
    await operation();
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    expect(durationMs).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(1000);
  });

  test("should handle structured cloning", () => {
    const complex = {
      date: new Date(),
      buffer: new ArrayBuffer(10),
      map: new Map([["key", "value"]]),
      circular: {} as any
    };
    complex.circular.self = complex.circular;

    const cloned = structuredClone(complex);

    expect(cloned).not.toBe(complex);
    expect(cloned.date).toBeInstanceOf(Date);
    expect(cloned.buffer).toBeInstanceOf(ArrayBuffer);
    expect(cloned.map).toBeInstanceOf(Map);
    expect(cloned.circular.self).toBe(cloned.circular);
  });

  test("should use Promise.withResolvers for timeouts", async () => {
    const { promise, resolve, reject } = Promise.withResolvers<string>();

    setTimeout(() => resolve("success"), 50);

    const result = await promise;
    expect(result).toBe("success");
  });

  test("should validate Object.hasOwn usage", () => {
    const obj = { prop: "value" };

    expect(Object.hasOwn(obj, "prop")).toBe(true);
    expect(Object.hasOwn(obj, "nonexistent")).toBe(false);
  });
});
```

## Common Pitfalls

### 1. BigInt Serialization

```typescript
// ❌ WRONG: BigInt can't be JSON serialized
const timing = {
  start: process.hrtime.bigint(),
  duration: 0n
};

JSON.stringify(timing); // ❌ Error: Do not know how to serialize a BigInt

// ✅ CORRECT: Convert BigInt to number
const timing = {
  start: Number(process.hrtime.bigint()),
  duration: 0
};
```

### 2. Promise.withResolvers Browser Support

```typescript
// ❌ WRONG: Assuming universal support
const { promise, resolve } = Promise.withResolvers();

// ✅ CORRECT: Check availability or polyfill
function createPromiseWithResolvers<T>() {
  if (typeof Promise.withResolvers === "function") {
    return Promise.withResolvers<T>();
  }

  // Fallback implementation
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}
```

### 3. structuredClone Limitations

```typescript
// ❌ WRONG: Assuming all objects can be cloned
function cloneAnything(obj: any) {
  return structuredClone(obj); // May fail with functions, symbols, etc.
}

// ✅ CORRECT: Handle limitations
function safeClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch (error) {
    console.warn("structuredClone failed:", error.message);
    // Fallback to JSON cloning (with its own limitations)
    return JSON.parse(JSON.stringify(obj));
  }
}
```

### 4. Memory Monitoring Overhead

```typescript
// ❌ WRONG: Tracking every small object
function processItems(items: string[]) {
  return items.map((item) => {
    const processed = item.toUpperCase();
    globalMemoryMonitor.trackObject(processed, "string"); // ❌ Too much overhead
    return processed;
  });
}

// ✅ CORRECT: Track significant objects only
function processItems(items: string[]) {
  const results = items.map((item) => item.toUpperCase());

  // Track the collection, not individual strings
  globalMemoryMonitor.trackObject(results, "processed_items", {
    count: results.length,
    createdAt: new Date()
  });

  return results;
}
```

## Validation Checklist

Use this checklist to ensure your migration is complete:

### ✅ Timing and Performance

- [ ] Replaced `Date.now()` with `process.hrtime.bigint()`
- [ ] Integrated with `globalPerformanceMonitor`
- [ ] Added proper duration calculations (ns to ms)
- [ ] Updated tests to use high-resolution timing

### ✅ Object Management

- [ ] Replaced `JSON.parse(JSON.stringify())` with `structuredClone()`
- [ ] Updated `hasOwnProperty` to `Object.hasOwn()`
- [ ] Added error handling for cloning failures
- [ ] Integrated with memory monitoring where appropriate

### ✅ Promise Management

- [ ] Migrated complex promise patterns to `Promise.withResolvers()`
- [ ] Implemented proper timeout handling
- [ ] Added external resolver control where needed
- [ ] Integrated with timeout management system

### ✅ Memory Management

- [ ] Replaced appropriate Maps with WeakMaps
- [ ] Added memory monitoring for significant objects
- [ ] Implemented automatic cleanup patterns
- [ ] Added memory leak detection

### ✅ Error Handling

- [ ] Enhanced error context with audit logging
- [ ] Implemented sophisticated retry logic
- [ ] Added security event logging for failures
- [ ] Included performance metrics in error reports

### ✅ Security

- [ ] Added PII detection and redaction
- [ ] Implemented data integrity verification
- [ ] Added comprehensive audit logging
- [ ] Used timing-safe comparisons for sensitive operations

### ✅ Testing

- [ ] Updated tests to use Node 22+ features
- [ ] Added high-resolution timing tests
- [ ] Tested structured cloning with complex objects
- [ ] Validated Promise.withResolvers usage
- [ ] Added memory monitoring tests

### ✅ Documentation

- [ ] Updated function documentation with Node 22+ examples
- [ ] Added migration notes for breaking changes
- [ ] Documented new features and capabilities
- [ ] Created usage examples for complex patterns

## Performance Validation

After migration, validate performance improvements:

```bash
# Run performance benchmarks
npm run test:performance

# Check memory usage
npm run test:memory

# Validate audit logging performance
npm run test:audit

# Run complete test suite
npm run test
```

## Rollback Strategy

If issues arise, you can rollback incrementally:

1. **Timing**: Keep both old and new implementations temporarily
2. **Cloning**: Add feature flags for structured cloning
3. **Promises**: Maintain backward compatibility for external APIs
4. **Monitoring**: Make monitoring systems optional during transition

Example feature flag approach:

```typescript
const useModernFeatures = process.env.USE_NODE22_FEATURES === "true";

function measureTime() {
  if (useModernFeatures) {
    return process.hrtime.bigint();
  } else {
    return BigInt(Date.now() * 1_000_000); // Convert to nanoseconds
  }
}
```

---

For additional help with migration, see the
[API Documentation](../api/node22-features.md) and
[Usage Examples](../examples/README.md).
