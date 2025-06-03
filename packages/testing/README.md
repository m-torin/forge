# @repo/testing

A centralized testing package for the forge-ahead repository.

## Features

- Modular Vitest configurations for different environments
- Common test setup utilities
- Mocking utilities for browser and Next.js environments
- Enhanced render utilities for React components
- **Complete database mocking and testing utilities**
- **Support for Firestore, Upstash Vector, and Upstash Redis**
- **Database-specific test helpers and configurations**

## Usage

### Basic Setup

The simplest way to use this package is to export the default configuration:

```ts
// vitest.config.ts
export { default } from '@repo/testing';
```

This provides a React-specific configuration with common settings.

### Custom Configurations

You can create custom configurations for different environments:

#### React Applications

```ts
// vitest.config.ts
import { createReactConfig } from '@repo/testing/config/react.js';

export default createReactConfig({
  setupFiles: ['./test-setup.ts'],
  // Additional configuration...
});
```

#### Node.js Applications

```ts
// vitest.config.ts
import { createNodeConfig } from '@repo/testing/config/node.js';

export default createNodeConfig({
  setupFiles: ['./test-setup.ts'],
  // Additional configuration...
});
```

#### Next.js Applications

```ts
// vitest.config.ts
import { createNextConfig } from '@repo/testing/config/next.js';

export default createNextConfig({
  setupFiles: ['./test-setup.ts'],
  includeAppDir: true,
  // Additional configuration...
});
```

### Test Setup

Create a test setup file in your package/app:

```ts
// test-setup.ts
import '@repo/testing/setup/nextjs.js';

// Add package/app-specific test setup here
process.env.TEST_API_KEY = 'test_key';
```

### Using Utilities

#### Rendering Components

```tsx
import { render, screen } from '@repo/testing/utils/render.js';
import { MyComponent } from './my-component';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello, world!')).toBeInTheDocument();
});
```

#### Using Mocks

```ts
import { setupNextMocks } from '@repo/testing/mocks/next.js';
import { setupBrowserMocks } from '@repo/testing/mocks/browser.js';

// Setup at the top of your test file or in your setup file
setupNextMocks();
setupBrowserMocks();
```

#### Suppressing Console Errors

```ts
import { suppressConsoleErrors } from '@repo/testing/setup/common.js';

// Suppress React warning messages in tests
suppressConsoleErrors([/Warning: ReactDOM.render/]);
```

## Configuration Options

### Base Config Options

- `rootDir`: Root directory for the test (defaults to process.cwd())
- `setupFiles`: Array of setup files to run before tests
- `coverage`: Whether to enable coverage reporting
- `environment`: Test environment (jsdom, node, happy-dom)
- `aliases`: Additional path aliases

### React Config Options

- All base config options
- `reactOptions`: Options to pass to @vitejs/plugin-react

### Next.js Config Options

- All React config options
- `includeAppDir`: Whether to include the app directory in aliases (default: true)

## Database Testing

This package provides comprehensive mocking and testing utilities for all database adapters in the
monorepo.

### Quick Start

```typescript
import {
  createUpstashRedisAdapter,
  DatabaseTestHelper,
  testDatabaseOperations,
} from '@repo/testing';

describe('Database Tests', () => {
  let helper: DatabaseTestHelper;

  beforeEach(async () => {
    const adapter = createUpstashRedisAdapter();
    helper = new DatabaseTestHelper(adapter, { provider: 'upstash-redis' });
    await helper.setup();
  });

  afterEach(async () => {
    await helper.cleanup();
  });

  it('should perform basic operations', async () => {
    await testDatabaseOperations(helper, 'users');
  });
});
```

### Supported Database Mocks

- **Firestore**: Complete mock with collections, documents, queries, transactions
- **Upstash Vector**: Full vector database simulation with similarity search
- **Upstash Redis**: Complete Redis operations (strings, lists, sets, hashes, sorted sets)

### Database-Specific Configurations

```typescript
// vitest.config.ts
import { redisTestConfig } from '@repo/testing/config/database';

export default redisTestConfig();
```

### Test Helpers

- `DatabaseTestHelper`: Generic helper for all database types
- `VectorDatabaseTestHelper`: Specialized for vector operations
- `RedisDatabaseTestHelper`: Specialized for Redis operations

For detailed database testing documentation, see [DATABASE_TESTING.md](./DATABASE_TESTING.md).
