# @repo/core-utils

- _Can build:_ **NO** (consumed from source)
- _Exports:_
  - **Shared**: Pure, environment-neutral utilities (browser, edge, Node.js)
  - **Server**: Node.js-specific utilities with advanced features

- _AI Hints:_
  ```typescript
  // Primary: Framework-agnostic core utilities for all packages
  // Shared: import { safeStringify } from '@repo/core-utils/shared/stringify'
  // Server: import { SafeStringifier } from '@repo/core-utils/server/stringify-advanced'
  // ❌ NEVER: Import internal files - use public exports only
  ```

Core utilities package providing framework-agnostic, reusable utilities for the
entire monorepo. This package is the foundation for all other packages, offering
battle-tested implementations of common patterns.

## Overview

The Core Utils package provides two export paths:

1. **`/shared`** - Pure, environment-neutral utilities
   - Works in browser, edge runtime, and Node.js
   - No Node.js-specific APIs
   - Suitable for client components and edge middleware

2. **`/server`** - Node.js-specific utilities with advanced features
   - Uses Node.js APIs (fs, Buffer, process)
   - Enhanced with performance monitoring and memory tracking
   - Server-only code

## Installation

```bash
# Already included as workspace dependency
pnpm install
```

## Module Organization

### Shared Utilities (`/shared`)

Pure utilities with zero Node.js dependencies:

```typescript
// JSON stringification
import {
  safeStringify,
  safeStringifyPure
} from "@repo/core-utils/shared/stringify";

// Safe for browser, edge, and Node.js
const json = safeStringify(obj, 75000);

// With metadata
const result = safeStringifyPure(obj, { prettify: true, maxLength: 50000 });
console.log(result.metadata.circularRefs); // Number of circular references found
```

### Server Utilities (`/server`)

Node.js-specific utilities with advanced features:

```typescript
// Advanced stringify with Buffer support and memory tracking
import { SafeStringifier } from "@repo/core-utils/server/stringify-advanced";

const stringifier = new SafeStringifier({
  maxLength: 100000,
  prettify: true,
  includeMetadata: true
});

const result = stringifier.stringify(obj);
console.log(result.metadata.memoryUsage); // Heap memory used
console.log(result.metadata.circularRefs); // Circular references
```

## Available Utilities

### String Processing

#### `safeStringify` (Shared)

Pure JSON stringification with circular reference handling.

```typescript
import { safeStringify } from "@repo/core-utils/shared/stringify";

const json = safeStringify(complexObject, 75000);
// Handles: circular refs, undefined, functions, symbols, Maps, Sets, Errors
```

#### `SafeStringifier` (Server)

Advanced stringifier with Node.js features.

```typescript
import { SafeStringifier } from "@repo/core-utils/server/stringify-advanced";

const stringifier = new SafeStringifier({ includeMetadata: true });
const result = stringifier.stringify(obj);

console.log(result.metadata);
// {
//   executionTime: 5.23,
//   originalLength: 1024,
//   truncated: false,
//   circularRefs: 2,
//   memoryUsage: 125829120
// }
```

### Caching

#### `BoundedCache` (Server)

LRU cache with TTL, analytics, and memory management.

```typescript
import { BoundedCache } from "@repo/core-utils/server/cache";

const cache = new BoundedCache({
  maxSize: 100,
  ttl: 1800000, // 30 minutes
  enableAnalytics: true
});

cache.set("key", value);
const value = cache.get("key");

// Analytics
const analytics = cache.getAnalytics();
console.log(analytics.hitRate); // Cache hit rate percentage
console.log(analytics.memoryUsage); // Estimated memory usage

// Cleanup
const cleaned = cache.cleanup(); // Smart cleanup based on memory pressure
const forceCleaned = cache.cleanup(true); // Force cleanup
```

#### `CacheRegistry` (Server)

Centralized cache management across the application.

```typescript
import { globalCacheRegistry } from "@repo/core-utils/server/cache";

// Create named caches
const cache = globalCacheRegistry.create("user-cache", {
  maxSize: 50,
  ttl: 600000
});

// Retrieve existing cache
const sameCache = globalCacheRegistry.get("user-cache");

// Global analytics
const analytics = globalCacheRegistry.getGlobalAnalytics();
console.log(analytics.totalHits);
console.log(analytics.totalMisses);
console.log(analytics.cacheCount);

// Cleanup all caches
const results = globalCacheRegistry.cleanupAll();
```

### Logging

#### `AsyncLogger` (Server)

High-performance async logger with buffering and file rotation.

```typescript
import { AsyncLogger } from "@repo/core-utils/server/logger";

const logger = new AsyncLogger({
  sessionId: "analysis-session-123",
  logDir: "./logs",
  logLevel: "info",
  maxBufferSize: 16384, // 16KB buffer
  maxFileSize: 10485760, // 10MB before rotation
  maxFiles: 5 // Keep 5 rotated files
});

await logger.init();

logger.log("Processing started", "info");
logger.log("Error occurred", "error");

// Force flush buffer to disk
logger.flush();

// Get statistics
const stats = logger.getStats();
console.log(stats.messagesLogged);
console.log(stats.bytesWritten);
console.log(stats.flushCount);

// Cleanup
await logger.close();
```

#### `LoggerRegistry` (Server)

Centralized logger management.

```typescript
import { globalLoggerRegistry } from "@repo/core-utils/server/logger";

// Create named logger
const logger = globalLoggerRegistry.create("main-logger", {
  sessionId: "session-123",
  logLevel: "debug"
});

await logger.init();

// Retrieve logger
const sameLogger = globalLoggerRegistry.get("main-logger");

// Global stats
const stats = globalLoggerRegistry.getGlobalStats();

// Close specific logger
await globalLoggerRegistry.close("main-logger");

// Close all loggers
await globalLoggerRegistry.closeAll();
```

### Code Analysis Tools (Server)

Advanced utilities for code analysis and transformation:

```typescript
// File discovery with ignore patterns
import { FileDiscovery } from "@repo/core-utils/server/file-discovery";

// Pattern detection and analysis
import { PatternAnalyzer } from "@repo/core-utils/server/pattern-analyzer";

// Code transformation
import { CodeTransformer } from "@repo/core-utils/server/code-transformation";

// Dependency analysis
import { DependencyAnalyzer } from "@repo/core-utils/server/dependency-analyzer";

// Security scanning
import { SecurityScanner } from "@repo/core-utils/server/security-scanner";

// Memory monitoring
import { MemoryMonitor } from "@repo/core-utils/server/advanced-memory-monitor";

// Workflow orchestration
import { WorkflowOrchestrator } from "@repo/core-utils/server/workflow-orchestrator";
```

### Performance & Monitoring (Server)

```typescript
// Performance tracking
import { PerformanceTracker } from "@repo/core-utils/server/performance";

// Memory-aware caching
import { MemoryAwareCache } from "@repo/core-utils/server/memory-aware-cache";

// Resource lifecycle management
import { ResourceLifecycleManager } from "@repo/core-utils/server/resource-lifecycle-manager";

// Context management
import { ContextManager } from "@repo/core-utils/server/context-manager";
```

### Utility Helpers (Server)

```typescript
// Retry logic
import { retry } from "@repo/core-utils/server/retry";

// Batch processing
import { BatchProcessor } from "@repo/core-utils/server/batch-processor";

// Worker pool management
import { WorkerPool } from "@repo/core-utils/server/worker-pool";

// Abort support
import { withAbort } from "@repo/core-utils/server/abort-support";

// Stream utilities
import { streamToString } from "@repo/core-utils/server/streams";

// Structured cloning
import { safeStructuredClone } from "@repo/core-utils/server/structured-clone";
```

## Usage Patterns

### In Next.js App (Server Components)

```typescript
// Server components can use server utilities
import { SafeStringifier } from '@repo/core-utils/server/stringify-advanced';

export default async function Page() {
  const data = await fetchData();
  const stringifier = new SafeStringifier();
  const json = stringifier.stringify(data);

  return <pre>{json.result}</pre>;
}
```

### In Next.js App (Client Components)

```typescript
'use client';

// Client components must use shared utilities only
import { safeStringify } from '@repo/core-utils/shared/stringify';

export function ClientComponent({ data }: Props) {
  const json = safeStringify(data, 50000);
  return <pre>{json}</pre>;
}
```

### In Edge Middleware

```typescript
// Edge runtime must use shared utilities only
import { safeStringify } from "@repo/core-utils/shared/stringify";

export function middleware(req: NextRequest) {
  const debug = safeStringify(req.headers);
  console.log(debug);
  return NextResponse.next();
}
```

### In Package Code

```typescript
// Packages should prefer shared utilities for maximum portability
import { safeStringify } from "@repo/core-utils/shared/stringify";

// Use server utilities only when Node.js features are required
import { AsyncLogger } from "@repo/core-utils/server/logger";
```

## Architecture Decisions

### Why Two Export Paths?

**`/shared`** - Pure JavaScript, works everywhere:

- Client components
- Edge middleware
- Server components
- Packages (maximum portability)

**`/server`** - Node.js optimized:

- File system operations
- Buffer handling
- Process memory monitoring
- Performance profiling

### Zero Code Loss Migration

This package was created by consolidating utilities from `@repo/mcp-server`,
ensuring:

- ✅ All 55 utility files preserved
- ✅ All functionality maintained
- ✅ Import paths updated automatically
- ✅ Zero breaking changes

The `@repo/mcp-server` package now acts as a thin MCP protocol wrapper over
these core utilities.

## Development

### Running Tests

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

### Linting & Type Checking

```bash
pnpm lint
pnpm typecheck
```

### Package Structure

```
packages/core-utils/
├── src/
│   ├── shared/              # Pure, environment-neutral utilities
│   │   ├── stringify.ts     # Safe JSON stringification
│   │   └── index.ts
│   ├── server/              # Node.js-specific utilities
│   │   ├── cache.ts         # Bounded cache with LRU
│   │   ├── logger.ts        # Async logger
│   │   ├── stringify-advanced.ts  # Advanced stringification
│   │   ├── file-discovery.ts      # File system utilities
│   │   ├── pattern-analyzer.ts    # Code pattern detection
│   │   ├── code-transformation.ts # AST transformations
│   │   ├── dependency-analyzer.ts # Dependency graphs
│   │   ├── security-scanner.ts    # Security analysis
│   │   └── ... (50+ more utilities)
│   └── index.ts             # Main exports
├── __tests__/               # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## Migration from @repo/mcp-server

If you were using utilities directly from `@repo/mcp-server`:

### Before

```typescript
import { safeStringify } from "@repo/mcp-server/utils/stringify";
import { BoundedCache } from "@repo/mcp-server/utils/cache";
```

### After

```typescript
import { safeStringify } from "@repo/core-utils/shared/stringify";
import { BoundedCache } from "@repo/core-utils/server/cache";
```

**Note**: The `@repo/mcp-server` package re-exports these for backward
compatibility, but direct imports from `@repo/core-utils` are preferred.

## Contributing

1. **Add shared utilities** in `src/shared/` (environment-neutral)
2. **Add server utilities** in `src/server/` (Node.js-specific)
3. **Export from index files** for public API
4. **Add comprehensive tests** in `__tests__/`
5. **Update documentation** in README.md
6. **Follow naming conventions**: `*.ts` for source, `*.test.ts` for tests

## Design Principles

1. **Framework-agnostic**: Works with Next.js, React, Node.js, edge runtime
2. **Zero dependencies** (except catalog versions): Minimal external
   dependencies
3. **Type-safe**: Full TypeScript support with exported types
4. **Well-tested**: Comprehensive test coverage
5. **Performance**: Optimized for production use
6. **Reusable**: DRY - single implementation for all packages

## License

Private package for internal use in the forge-fork monorepo.
