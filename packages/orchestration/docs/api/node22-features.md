# Node 22+ Features API Documentation

## Overview

The `@repo/orchestration` package has been fully modernized to leverage
cutting-edge Node.js 22+ and ES2023 features for enhanced performance, safety,
and developer experience.

## Core Node 22+ Features

### 1. High-Resolution Timing with `process.hrtime.bigint()`

```typescript
import { globalPerformanceMonitor } from "@repo/orchestration";

// Start high-precision timing
const startTime = process.hrtime.bigint();

// Perform operations...
await someOperation();

// Calculate precise duration
const endTime = process.hrtime.bigint();
const durationNs = endTime - startTime;
const durationMs = Number(durationNs) / 1_000_000;

// Integrated with performance monitoring
const timingId = globalPerformanceMonitor.startTiming("operation-name");
const metrics = globalPerformanceMonitor.endTiming(timingId);
```

**Benefits:**

- Nanosecond precision timing
- Monotonic clock (not affected by system time changes)
- Perfect for performance benchmarking and SLA monitoring

### 2. Safe Object Cloning with `structuredClone()`

```typescript
// Safe deep cloning of complex objects
const complexObject = {
  data: new ArrayBuffer(1024),
  date: new Date(),
  map: new Map([["key", "value"]]),
  set: new Set([1, 2, 3]),
  nested: { deep: { value: "test" } }
};

// Handles circular references and complex types
const cloned = structuredClone(complexObject);

// Use in memory monitoring
globalMemoryMonitor.trackObject(cloned, "cloned_object", {
  originalSize: JSON.stringify(complexObject).length,
  clonedAt: new Date()
});
```

**Benefits:**

- Handles circular references automatically
- Preserves object types (Date, ArrayBuffer, etc.)
- More reliable than JSON.parse(JSON.stringify())

### 3. Safe Property Access with `Object.hasOwn()`

```typescript
// Safe property checking (replaces hasOwnProperty)
const config = {
  enableFeature: true,
  threshold: 100
};

// Modern, safe property checking
if (Object.hasOwn(config, "enableFeature")) {
  // Safe to access config.enableFeature
}

// Integrated in validation utilities
function validateConfig(config: unknown): config is Config {
  return (
    typeof config === "object" &&
    config !== null &&
    Object.hasOwn(config, "enableFeature") &&
    Object.hasOwn(config, "threshold")
  );
}
```

**Benefits:**

- No prototype pollution concerns
- Cleaner than `hasOwnProperty.call()`
- Type-safe property validation

### 4. Advanced Promise Control with `Promise.withResolvers()`

```typescript
// Modern promise creation with external resolvers
function createTimeoutOperation<T>(
  operation: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();

  const timeoutId = setTimeout(() => {
    reject(new Error(`Operation timed out after ${timeoutMs}ms`));
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

// Usage with timeout manager
const result = await globalTimeoutManager.wrapWithTimeout(
  someAsyncOperation(),
  5000,
  { name: "critical-operation" }
);
```

**Benefits:**

- External resolver control
- Better timeout handling
- Cleaner async patterns

## Enhanced Utilities

### Performance Monitoring

```typescript
import { globalPerformanceMonitor } from "@repo/orchestration";

// Start monitoring
await globalPerformanceMonitor.start();

// Track operations
const timingId = globalPerformanceMonitor.startTiming("database-query");
const result = await database.query("SELECT * FROM users");
const metrics = globalPerformanceMonitor.endTiming(timingId);

console.log(`Query took ${metrics.durationMs}ms`);

// Get comprehensive metrics
const currentMetrics = globalPerformanceMonitor.getCurrentMetrics();
console.log("CPU Usage:", currentMetrics.cpu.usage);
console.log("Memory Usage:", currentMetrics.memory.heapUsed);
console.log("Event Loop Lag:", currentMetrics.eventLoop.lag);
```

### Memory Monitoring

```typescript
import { globalMemoryMonitor } from "@repo/orchestration";

// Start memory monitoring
await globalMemoryMonitor.start();

// Track objects with metadata
const largeObject = createLargeObject();
globalMemoryMonitor.trackObject(largeObject, "user_data", {
  userId: "user-123",
  operation: "data_processing"
});

// Check for memory leaks
const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
if (potentialLeaks.length > 0) {
  console.warn("Potential memory leaks detected:", potentialLeaks);
}

// Get memory metrics
const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();
```

### Audit Logging

```typescript
import { AuditUtils, globalAuditLogger } from "@repo/orchestration";

// Start audit logging
await startGlobalAuditLogging({
  enableIntegrityChecks: true,
  enablePiiDetection: true,
  enableRealTimeAlerts: true
});

// Log user authentication
await AuditUtils.logAuthentication(
  true, // success
  "user-123",
  "password",
  { ipAddress: "192.168.1.1" }
);

// Log data access
await AuditUtils.logDataAccess(
  "user_profile",
  "profile-456",
  "update",
  "user-123",
  true,
  { changes: ["email", "phone"] }
);

// Log security events
await AuditUtils.logSecurityEvent(
  "Suspicious login attempt detected",
  "high",
  ["brute_force", "authentication"],
  { attempts: 5, timeWindow: "5min" }
);
```

### Timeout Management

```typescript
import { globalTimeoutManager } from "@repo/orchestration";

// Wrap operations with timeout
const result = await globalTimeoutManager.wrapWithTimeout(
  fetchUserData(userId),
  3000, // 3 second timeout
  {
    name: "user-data-fetch",
    onTimeout: () => console.log("User data fetch timed out")
  }
);

// Batch timeout management
const results = await globalTimeoutManager.wrapMultipleWithTimeout([
  { operation: fetchUser(), timeout: 2000, name: "fetch-user" },
  { operation: fetchProfile(), timeout: 1500, name: "fetch-profile" },
  { operation: fetchSettings(), timeout: 1000, name: "fetch-settings" }
]);
```

## Streaming Utilities

### Stream Processing

```typescript
import { StreamUtils, createStreamProcessor } from "@repo/orchestration";

// Create a stream processor with backpressure control
const processor = createStreamProcessor(
  async (item) => {
    // Process each item
    const processed = await processItem(item);
    return processed;
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
const dataStream = StreamUtils.arrayToAsyncIterable(largeDataArray);

// Process stream with memory monitoring
const results = [];
for await (const result of processor.processStream(dataStream)) {
  results.push(result);

  // Check memory periodically
  if (results.length % 1000 === 0) {
    const memory = globalMemoryMonitor.getCurrentMetrics();
    if (memory && memory.heapUsed > 200 * 1024 * 1024) {
      // 200MB
      console.warn("High memory usage detected, pausing...");
      break;
    }
  }
}
```

## Data Masking and Security

### PII Detection and Redaction

```typescript
import { DataMaskingUtils } from "@repo/orchestration";

// Automatic PII detection and masking
const sensitiveData = {
  name: "John Doe",
  ssn: "123-45-6789",
  email: "john@example.com",
  creditCard: "4111-1111-1111-1111"
};

const masked = DataMaskingUtils.maskPII(sensitiveData);
// Result: { name: 'John Doe', ssn: '***-**-6789', email: 'j***@example.com', creditCard: '****-****-****-1111' }

// Custom masking rules
const customMasked = DataMaskingUtils.maskWithRules(sensitiveData, {
  ssn: "full", // Completely mask
  email: "partial", // Partially mask
  creditCard: "last4" // Show only last 4 digits
});
```

### Cryptographic Integrity

```typescript
import { createHash, randomBytes } from "crypto";

// Generate secure checksums for audit events
function generateIntegrityChecksum(data: any): string {
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  return createHash("sha256").update(dataString).digest("hex");
}

// Verify data integrity
function verifyIntegrity(data: any, expectedChecksum: string): boolean {
  const actualChecksum = generateIntegrityChecksum(data);
  return actualChecksum === expectedChecksum;
}
```

## Type Safety and Validation

### Discriminated Unions for Enhanced Type Safety

```typescript
// Audit event types with discriminated unions
type AuditEvent =
  | { type: "authentication"; userId: string; success: boolean }
  | { type: "data_access"; resource: string; operation: string }
  | { type: "security_event"; severity: "low" | "medium" | "high" | "critical" }
  | { type: "workflow_execution"; workflowId: string; stepId?: string };

function processAuditEvent(event: AuditEvent) {
  switch (event.type) {
    case "authentication":
      // TypeScript knows this has userId and success
      console.log(
        `Auth attempt for ${event.userId}: ${event.success ? "success" : "failure"}`
      );
      break;
    case "data_access":
      // TypeScript knows this has resource and operation
      console.log(`${event.operation} access to ${event.resource}`);
      break;
    // ... other cases
  }
}
```

## Error Handling and Resilience

### Graceful Error Recovery

```typescript
// Resilient operation with automatic retry
async function resilientOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();

      // Log successful operation
      await AuditUtils.logDataAccess(
        "resilient_operation",
        `attempt-${attempt}`,
        "execute",
        "system",
        true,
        { attempts: attempt, maxRetries }
      );

      return result;
    } catch (error) {
      lastError = error as Error;

      // Log failed attempt
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
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw lastError!;
}
```

## Performance Best Practices

### Memory Management

```typescript
// Use WeakMap for automatic garbage collection
const objectMetadata = new WeakMap<object, ObjectMetadata>();

function trackObjectMetadata(obj: object, metadata: ObjectMetadata) {
  objectMetadata.set(obj, metadata);
  // Automatically cleaned up when obj is garbage collected
}

// Efficient streaming with backpressure
async function processLargeDataset(data: unknown[]) {
  const processor = createStreamProcessor(
    async (item) => await processItem(item),
    {
      concurrency: 10,
      backpressure: {
        memoryThresholdMB: 100,
        pauseOnPressure: true
      }
    }
  );

  const stream = StreamUtils.arrayToAsyncIterable(data);
  const results = [];

  for await (const result of processor.processStream(stream)) {
    results.push(result);

    // Periodic cleanup
    if (results.length % 1000 === 0) {
      // Force garbage collection if available (development only)
      if (global.gc && process.env.NODE_ENV === "development") {
        global.gc();
      }
    }
  }

  return results;
}
```

### CPU Optimization

```typescript
// Use high-resolution timing for accurate performance measurement
function benchmark<T>(
  operation: () => Promise<T>
): Promise<{ result: T; durationNs: bigint }> {
  return new Promise(async (resolve) => {
    const startTime = process.hrtime.bigint();
    const result = await operation();
    const endTime = process.hrtime.bigint();
    const durationNs = endTime - startTime;

    resolve({ result, durationNs });
  });
}

// Concurrent processing with controlled parallelism
async function processConcurrently<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 10
): Promise<R[]> {
  const results: R[] = [];
  const inProgress = new Set<Promise<void>>();

  for (const item of items) {
    if (inProgress.size >= concurrency) {
      // Wait for one to complete
      await Promise.race(inProgress);
    }

    const promise = processor(item).then((result) => {
      results.push(result);
      inProgress.delete(promise);
    });

    inProgress.add(promise);
  }

  // Wait for all remaining
  await Promise.all(inProgress);

  return results;
}
```

## Configuration Examples

### Audit Logging Configuration

```typescript
import { startGlobalAuditLogging } from "@repo/orchestration";

// Development configuration
await startGlobalAuditLogging({
  enableIntegrityChecks: true,
  enablePiiDetection: true,
  enableRealTimeAlerts: false, // Disable for development
  batchSize: 10,
  flushInterval: 1000,
  alertThresholds: {
    highRiskEvents: 20,
    failedAuthentications: 10,
    dataAccessRate: 2000,
    errorRate: 100
  }
});

// Production configuration
await startGlobalAuditLogging({
  enableIntegrityChecks: true,
  enablePiiDetection: true,
  enableRealTimeAlerts: true,
  batchSize: 1000,
  flushInterval: 5000,
  encryptionKey: process.env.AUDIT_ENCRYPTION_KEY,
  alertThresholds: {
    highRiskEvents: 5,
    failedAuthentications: 3,
    dataAccessRate: 1000,
    errorRate: 50
  }
});
```

## Migration from Legacy Patterns

### Before (Legacy)

```typescript
// Old timing approach
const start = Date.now();
await operation();
const duration = Date.now() - start; // Millisecond precision only

// Old object cloning
const cloned = JSON.parse(JSON.stringify(obj)); // Breaks with dates, functions, etc.

// Old property checking
if (obj.hasOwnProperty("prop")) {
  // Prototype pollution risk
  // ...
}

// Old promise patterns
const promise = new Promise((resolve, reject) => {
  // External resolve/reject not easily accessible
});
```

### After (Node 22+)

```typescript
// New high-resolution timing
const start = process.hrtime.bigint();
await operation();
const durationNs = process.hrtime.bigint() - start; // Nanosecond precision

// New safe cloning
const cloned = structuredClone(obj); // Handles all types, circular refs

// New safe property checking
if (Object.hasOwn(obj, "prop")) {
  // No prototype pollution
  // ...
}

// New promise patterns
const { promise, resolve, reject } = Promise.withResolvers();
// External control available
```

## Testing with Node 22+ Features

```typescript
import { describe, test, expect } from "vitest";

describe("Node 22+ Features", () => {
  test("should use high-resolution timing", async () => {
    const start = process.hrtime.bigint();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    expect(durationMs).toBeGreaterThan(90);
    expect(durationMs).toBeLessThan(200);
  });

  test("should safely clone complex objects", () => {
    const complex = {
      date: new Date(),
      buffer: new ArrayBuffer(10),
      map: new Map([["key", "value"]]),
      set: new Set([1, 2, 3])
    };

    const cloned = structuredClone(complex);

    expect(cloned).not.toBe(complex);
    expect(cloned.date).toBeInstanceOf(Date);
    expect(cloned.buffer).toBeInstanceOf(ArrayBuffer);
    expect(cloned.map).toBeInstanceOf(Map);
    expect(cloned.set).toBeInstanceOf(Set);
  });

  test("should use Promise.withResolvers for timeout handling", async () => {
    const { promise, resolve, reject } = Promise.withResolvers<string>();

    setTimeout(() => resolve("success"), 50);

    const result = await promise;
    expect(result).toBe("success");
  });
});
```

---

For more detailed examples and advanced usage patterns, see the
[Usage Examples](./examples.md) and [Migration Guide](./migration-guide.md).
