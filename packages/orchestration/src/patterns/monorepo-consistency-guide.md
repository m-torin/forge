# Node 22+ Monorepo Consistency Guide

> **Comprehensive guide for implementing consistent Node 22+ patterns across all
> packages in the monorepo**

## 🎯 Overview

This guide establishes standardized practices for using Node 22+ features
consistently across the entire monorepo. Following these patterns ensures
optimal performance, maintainability, and developer experience while leveraging
the full power of Node.js 22+.

## 📋 Core Principles

### 1. **Consistency First**

- All packages must use identical Node 22+ patterns
- Standardized error handling and cleanup mechanisms
- Common API interfaces across package boundaries

### 2. **Performance Optimization**

- Memory-efficient implementations with WeakMap/WeakSet
- High-resolution timing for accurate measurements
- Proper resource cleanup with FinalizationRegistry

### 3. **Type Safety**

- Full TypeScript support with generic patterns
- Comprehensive type definitions for all utilities
- Runtime validation where appropriate

### 4. **Observability**

- Built-in monitoring and debugging capabilities
- Cross-package tracking and analytics
- Performance metrics collection

## 🏗️ Architecture Patterns

### Package Structure Convention

```
packages/[package-name]/
├── src/
│   ├── node22-features.ts      # Package-specific Node 22+ implementations
│   ├── patterns/               # Local pattern implementations
│   │   ├── promise-patterns.ts
│   │   ├── memory-patterns.ts
│   │   └── cleanup-patterns.ts
│   ├── shared/                 # Cross-package utilities
│   └── index.ts                # Main exports
├── __tests__/
│   ├── node22-features.test.ts
│   └── integration/
└── package.json
```

### Import Convention

```typescript
// ✅ Standard pattern imports
import { Node22Patterns } from "@repo/orchestration/patterns";
import { useNode22Patterns } from "@repo/orchestration/patterns";

// ✅ Package-specific implementations
import { packageSpecificFeature } from "./node22-features";

// ✅ Cross-package coordination
import { CrossPackageMemoryMonitor } from "@repo/orchestration/patterns";
```

## 🔧 Implementation Standards

### 1. Promise.withResolvers() Patterns

#### Standard Usage Pattern

```typescript
import { Node22Patterns } from "@repo/orchestration/patterns";

// ✅ Consistent pattern
async function executeWithCoordination<T>(
  operation: () => Promise<T>,
  options: { timeout?: number; abortSignal?: AbortSignal } = {}
): Promise<T> {
  return Node22Patterns.Promise.executeWithCoordination((resolve, reject) => {
    operation().then(resolve).catch(reject);
  }, options);
}

// ✅ Batch operations
const results = await Node22Patterns.Promise.executeBatch(tasks, {
  concurrency: 5,
  timeout: 30000
});
```

#### Anti-Patterns to Avoid

```typescript
// ❌ Don't create raw Promise constructors
new Promise((resolve, reject) => {
  // Manual promise creation without standardization
});

// ❌ Don't use inconsistent error handling
const { promise, resolve, reject } = Promise.withResolvers();
// Missing timeout, cancellation, or cleanup
```

### 2. AbortSignal.timeout() Patterns

#### Standard Usage Pattern

```typescript
import { Node22Patterns } from "@repo/orchestration/patterns";

// ✅ Consistent cancellation pattern
async function cancellableOperation<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeout: number = 30000
): Promise<T> {
  return Node22Patterns.Cancellation.withCancellation(operation, {
    timeout,
    onCancel: (reason) => console.log(`Operation cancelled: ${reason}`)
  });
}

// ✅ Retry with cancellation
const result = await Node22Patterns.Cancellation.withRetry(
  (attempt, signal) => attemptOperation(signal),
  { maxAttempts: 3, timeout: 10000 }
);
```

#### Anti-Patterns to Avoid

```typescript
// ❌ Don't use setTimeout with manual abort controllers
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);

// ❌ Don't ignore cancellation in operations
async function badOperation(signal: AbortSignal) {
  // Ignores signal.aborted checks
  return await longRunningTask();
}
```

### 3. structuredClone() Patterns

#### Standard Usage Pattern

```typescript
import { Node22Patterns } from "@repo/orchestration/patterns";

// ✅ Safe cloning with validation
const clonedData = Node22Patterns.DataSafety.validatedClone(
  originalData,
  (cloned) => cloned.id !== undefined && cloned.version > 0
);

// ✅ Cross-package data sharing
const sharedData = Node22Patterns.DataSafety.cloneForSharing(internalData, {
  removePrivateFields: true,
  forbiddenFields: ["secret", "token"]
});

// ✅ Batch cloning operations
const clonedItems = await Node22Patterns.DataSafety.cloneBatch(itemsToClone, {
  concurrency: 10
});
```

#### Anti-Patterns to Avoid

```typescript
// ❌ Don't use JSON.parse/stringify for deep cloning
const cloned = JSON.parse(JSON.stringify(original));

// ❌ Don't use Object.assign for complex objects
const cloned = Object.assign({}, original);

// ❌ Don't ignore cloning errors
try {
  return structuredClone(data);
} catch {
  return data; // Unsafe fallback
}
```

### 4. WeakMap/WeakSet Patterns

#### Standard Usage Pattern

```typescript
import { Node22Patterns } from "@repo/orchestration/patterns";

// ✅ Object tracking pattern
const tracker = new Node22Patterns.Memory.ObjectTracker<MyObject, Metadata>();
tracker.set(myObject, { created: Date.now(), status: "active" });

// ✅ Memory-efficient cache
const cache = new Node22Patterns.Memory.MemoryEfficientCache<
  CacheKey,
  CacheValue
>();
cache.set(key, value);

// ✅ Cross-package memory monitoring
const monitor = new Node22Patterns.Memory.CrossPackageMemoryMonitor();
monitor.registerPackage("my-package");
monitor.trackObject("my-package", importantObject);
```

#### Anti-Patterns to Avoid

```typescript
// ❌ Don't use Map for object references that should be garbage collected
const objectMap = new Map<object, any>(); // Prevents garbage collection

// ❌ Don't store objects without cleanup strategy
const globalObjects = new Set<object>(); // Memory leak risk
```

### 5. High-Resolution Timing Patterns

#### Standard Usage Pattern

```typescript
import { Node22Patterns } from "@repo/orchestration/patterns";

// ✅ Performance measurement
const timer = new Node22Patterns.Timing.HighResolutionTimer();
timer.checkpoint("operation-start");
await performOperation();
timer.checkpoint("operation-end");
const duration = timer.getDuration();

// ✅ Benchmarking operations
const benchmarkResults = await Node22Patterns.Timing.benchmark(
  {
    "fast-operation": () => fastOperation(),
    "slow-operation": () => slowOperation()
  },
  { iterations: 1000 }
);

// ✅ Timed operation with logging
const { result, duration } = await Node22Patterns.Timing.timeOperation(
  () => complexOperation(),
  { name: "ComplexOperation", logResult: true }
);
```

#### Anti-Patterns to Avoid

```typescript
// ❌ Don't use Date.now() for performance measurements
const start = Date.now();
await operation();
const duration = Date.now() - start; // Lower precision

// ❌ Don't ignore timing overhead
const start = process.hrtime.bigint();
// No accounting for measurement overhead
```

### 6. FinalizationRegistry Patterns

#### Standard Usage Pattern

```typescript
import { Node22Patterns } from "@repo/orchestration/patterns";

// ✅ Resource cleanup management
const cleanupManager = new Node22Patterns.Cleanup.ResourceCleanupManager();
const resourceId = cleanupManager.register(
  myResource,
  (resource) => resource.cleanup(),
  { tags: ["database", "connection"] }
);

// ✅ Cross-package cleanup coordination
const coordinator = new Node22Patterns.Cleanup.CrossPackageCleanupCoordinator();
coordinator.registerCrossPackageResource(
  "my-package",
  sharedResource,
  (resource) => resource.dispose(),
  { affectedPackages: ["analytics", "notifications"] }
);
```

#### Anti-Patterns to Avoid

```typescript
// ❌ Don't rely on manual cleanup only
class BadResource {
  dispose() {
    // Manual cleanup required - error prone
  }
}

// ❌ Don't ignore finalization registry setup
const registry = new FinalizationRegistry(() => {
  // No cleanup logic or error handling
});
```

## 📦 Package-Specific Guidelines

### Core Packages (`@repo/orchestration`, `@repo/auth`, `@repo/db-prisma`)

**Requirements:**

- Must implement all Node 22+ patterns
- Provide cross-package utilities and monitoring
- Export standardized pattern implementations
- Include comprehensive testing and validation

**Example Package Structure:**

```typescript
// src/index.ts
export { Node22Patterns } from "./patterns/node22-patterns";
export { Node22Manager } from "./managers/node22-manager";

// src/node22-features.ts
export class PackageSpecificManager {
  private readonly patterns = useNode22Patterns("core-package");

  async executeOperation() {
    this.patterns.trackUsage("Promise.executeWithCoordination");
    return this.patterns.Promise.executeWithCoordination(/* ... */);
  }
}
```

**Requirements:**

- Import and use standardized patterns from core packages
- Implement package-specific Node 22+ enhancements
- Follow cross-package integration patterns
- Provide service-specific monitoring and metrics

**Example Implementation:**

```typescript
// src/node22-features.ts
import {
  Node22Patterns,
  useNode22Patterns
} from "@repo/orchestration/patterns";

export class AnalyticsNode22Manager {
  private readonly patterns = useNode22Patterns("analytics");

  async batchEvents(events: Event[]) {
    this.patterns.trackUsage("Promise.executeBatch");

    return this.patterns.Promise.executeBatch(
      events.map((event) => () => this.processEvent(event)),
      { concurrency: 10, timeout: 5000 }
    );
  }
}
```

### UI Packages (`@repo/design-system`, `@repo/components`)

**Requirements:**

- Limited Node 22+ usage (client-side considerations)
- Focus on data safety patterns for props and state
- Use timing patterns for performance monitoring
- Implement memory-efficient component tracking

**Example Implementation:**

```typescript
// src/client-patterns.ts
import { Node22Patterns } from "@repo/orchestration/patterns";

export class ComponentStateManager {
  private readonly stateTracker = new Node22Patterns.Memory.ObjectTracker();

  cloneProps<T>(props: T): T {
    return Node22Patterns.DataSafety.safeClone(props);
  }

  trackComponent(component: React.Component, metadata: any) {
    this.stateTracker.set(component, metadata);
  }
}
```

## 🧪 Testing Standards

### Unit Testing Pattern

```typescript
// __tests__/node22-features.test.ts
import { describe, it, expect } from "vitest";
import { Node22Patterns } from "@repo/orchestration/patterns";

describe("Node22 Patterns", () => {
  describe("Promise patterns", () => {
    it("should execute with timeout and cancellation", async () => {
      const result = await Node22Patterns.Promise.executeWithCoordination(
        (resolve) => setTimeout(() => resolve("success"), 100),
        { timeout: 1000 }
      );

      expect(result).toBe("success");
    });

    it("should handle timeout gracefully", async () => {
      await expect(
        Node22Patterns.Promise.executeWithCoordination(
          (resolve) => setTimeout(() => resolve("success"), 2000),
          { timeout: 100 }
        )
      ).rejects.toThrow("Operation timed out");
    });
  });
});
```

### Integration Testing Pattern

```typescript
// __tests__/integration/cross-package.test.ts
import { Node22Patterns } from "@repo/orchestration/patterns";
import { AnalyticsNode22Manager } from "@repo/analytics/node22-features";

describe("Cross-package integration", () => {
  it("should coordinate operations across packages", async () => {
    const analytics = new AnalyticsNode22Manager();
    const notifications = new NotificationNode22Manager();

    // Test coordinated operation
    const results = await Node22Patterns.Promise.executeBatch([
      () => analytics.trackEvent({ type: "test" }),
      () => notifications.sendNotification("info", "test message")
    ]);

    expect(results.every((r) => r.status === "fulfilled")).toBe(true);
  });
});
```

## 📊 Monitoring and Metrics

### Pattern Usage Tracking

```typescript
// Monitor pattern usage across packages
import { Node22Patterns } from "@repo/orchestration/patterns";

const usageStats = Node22Patterns.Registry.getUsageStats();
console.log("Pattern usage:", usageStats);

const validation = Node22Patterns.Registry.validatePatterns();
if (!validation.consistent) {
  console.warn("Pattern inconsistencies detected:", validation.issues);
}
```

### Performance Monitoring

```typescript
// Cross-package performance monitoring
const monitor = new Node22Patterns.Memory.CrossPackageMemoryMonitor();

// Register all packages
["orchestration", "analytics", "notifications"].forEach((pkg) =>
  monitor.registerPackage(pkg)
);

// Get comprehensive metrics
const metrics = monitor.getAllMetrics();
console.log("Cross-package memory usage:", metrics);
```

## 🔄 Migration Strategy

### Phase 1: Core Package Migration (Week 1)

1. Implement standardized patterns in `@repo/orchestration`
2. Create comprehensive test suites
3. Validate performance characteristics
4. Document pattern usage

### Phase 2: Service Package Migration (Week 2)

2. Implement cross-package integration tests
3. Validate data flow and error handling
4. Monitor memory usage and performance

### Phase 3: Remaining Packages (Week 3)

1. Migrate remaining service packages
2. Update UI packages with client-appropriate patterns
3. Complete integration testing
4. Performance optimization and tuning

### Phase 4: Validation and Production (Week 4)

1. Run comprehensive validation suite
2. Performance benchmarking against baseline
3. Security audit and compliance validation
4. Production deployment preparation

## 🚨 Common Anti-Patterns and Solutions

### Anti-Pattern: Inconsistent Error Handling

```typescript
// ❌ Bad
try {
  const result = await operation();
} catch (error) {
  console.log(error); // Inconsistent error handling
}

// ✅ Good
try {
  const result = await Node22Patterns.Promise.executeWithCoordination(
    (resolve, reject) => operation().then(resolve).catch(reject),
    { timeout: 30000, onTimeout: () => logTimeout() }
  );
} catch (error) {
  logError("Operation failed", error);
  throw error;
}
```

### Anti-Pattern: Memory Leaks with Object References

```typescript
// ❌ Bad
const cache = new Map<object, any>(); // Prevents garbage collection
cache.set(obj, data);

// ✅ Good
const cache = new Node22Patterns.Memory.MemoryEfficientCache();
cache.set(obj, data); // Allows garbage collection
```

### Anti-Pattern: Ignoring Cancellation

```typescript
// ❌ Bad
async function operation(signal: AbortSignal) {
  return await longRunningTask(); // Ignores cancellation
}

// ✅ Good
async function operation(signal: AbortSignal) {
  return Node22Patterns.Cancellation.withCancellation(
    (cancelSignal) => longRunningTask(cancelSignal),
    { signal }
  );
}
```

## 📈 Success Metrics

### Code Quality Metrics

- **Pattern Consistency**: >95% across all packages
- **Test Coverage**: >90% for Node 22+ features
- **Type Safety**: 100% TypeScript coverage
- **Documentation**: Complete API documentation

### Performance Metrics

- **Memory Efficiency**: <5% increase in memory usage
- **Performance**: <2% performance overhead
- **Garbage Collection**: Improved GC patterns
- **Resource Cleanup**: 100% resource cleanup coverage

### Developer Experience Metrics

- **API Consistency**: Standardized interfaces across packages
- **Error Messages**: Clear, actionable error messages
- **Development Speed**: Reduced implementation time
- **Maintainability**: Simplified debugging and monitoring

## 🔗 Related Resources

- [Node.js 22+ Feature Documentation](https://nodejs.org/docs/latest/api/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Monorepo Best Practices](../documentation/monorepo-guide.md)
- [Performance Testing Guide](../testing/performance-testing.md)
- [Security Guidelines](../security/security-guide.md)

---

**Last Updated:** December 2024  
**Version:** 2.0.0  
**Maintainer:** Node 22+ Migration Team
