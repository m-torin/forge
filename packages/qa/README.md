# @repo/qa

A comprehensive testing utilities package for the monorepo, providing
centralized Vitest configurations, mock implementations, and test patterns with
enhanced type safety and performance optimizations.

- _Can build:_ **YES** (ESM library)
- _Node:_ **22+**
- _Package Manager:_ **pnpm**

## Features

- **🧪 Comprehensive Mock Library**: Pre-built mocks for Upstash Redis,
  Better-Auth, AI SDK, Stripe, and more
- **⚙️ Flexible Vitest Configurations**: Environment-specific configs for React,
  Next.js, Node.js, and Edge runtime
- **🎭 Enhanced Test Patterns**: Reusable test patterns with strong type safety
- **📊 Performance Monitoring**: Built-in performance tracking and memory
  management
- **🔍 Mock Management**: Advanced mock lifecycle management with debugging
  capabilities
- **📚 Rich TypeScript Support**: Comprehensive type definitions for better
  developer experience

## Exports

- **Core**: `./vitest/configs`, `./vitest/mocks`, `./vitest/utils`
- **Utilities**: `./shared/types`, `./playwright`
- **Quick Start**: Main exports with namespace support

## Quick Start

### Basic Setup

```typescript
// vitest.config.ts
import { createReactConfig } from "@repo/qa/vitest/configs";

export default createReactConfig({
  setupFiles: ["./test-setup.ts"]
});
```

```typescript
// test-setup.ts
import "@repo/qa/vitest/setup/react-package";
```

### Using Mocks

```typescript
// In your tests
import { setupVitestUpstashMocks } from "@repo/qa/vitest/mocks";
import { databaseAssertions, testDataGenerators } from "@repo/qa";

const { redis } = setupVitestUpstashMocks();

test("should store and retrieve data", async () => {
  await redis.set("key", "value");
  const result = await redis.get("key");
  expect(result).toBe("value");
});
```

### Test Patterns

```typescript
import { databaseAssertions, mockScenarios } from "@repo/qa";

// Use pre-built test patterns
mockScenarios.success(mockPrisma, ["User", "Post"]);
databaseAssertions.expectCrudCalls(mockPrisma, ["User"]);
```

## Available Configurations

### Vitest Configurations

- **`createReactConfig()`** - For React components and hooks
- **`createNextAppConfig()`** - For Next.js app directory
- **`createNodePackageConfig()`** - For Node.js packages
- **`createDatabaseTestConfig()`** - For database testing
- **`createEdgeRuntimeConfig()`** - For Edge runtime compatibility

### Mock Providers

- **Upstash**: Redis, QStash, Rate Limiting, Vector, Workflow
- **Authentication**: Better-Auth with organization support
- **Payments**: Stripe with comprehensive API coverage
- **AI Services**: AI SDK, Vercel AI utilities
- **Cloud Services**: Sentry, LogTail, Google Firestore
- **Next.js**: Components, routing, fonts, metadata

## TypeScript Support

The package provides comprehensive TypeScript definitions:

```typescript
import type { QA } from "@repo/qa";

// Use enhanced mock types
const mockClient: QA.DatabaseClient = createMockPrismaClient();
const redisClient: QA.RedisClient = createMockRedisClient();
```

## Advanced Features

### Mock Manager

```typescript
import { mockManager } from "@repo/qa/vitest/utils/mock-manager";

// Register mocks with metadata
const mockId = mockManager.register(vi.fn(), {
  name: "userService.createUser",
  type: "function",
  group: "userService"
});

// Clean up by group
mockManager.cleanup({ groups: ["userService"] });
```

### Quick Start Utilities

```typescript
import { quickStart } from "@repo/qa";

// Set up complete testing environment
const { redis, auth } = await quickStart.setupFullEnvironment();

// Clean up everything
await quickStart.cleanupAll();
```

## Documentation

- **[Full Documentation](../../apps/docs/packages/qa/index.mdx)**
- **[API Reference](./src/index.ts)** - TypeScript definitions with examples
- **[Mock Providers](./src/vitest/mocks/providers/)** - Service-specific mock
  implementations
- **[Test Patterns](./src/vitest/utils/test-patterns.ts)** - Reusable test
  utilities
