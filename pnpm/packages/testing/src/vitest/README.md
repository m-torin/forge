# Next-Forge Testing Utilities

This module provides a comprehensive set of testing utilities for the Next-Forge
monorepo, organized by function rather than by framework.

## Usage

The testing utilities are designed to be imported directly from
`@repo/testing/vitest`:

```typescript
import {
  render,
  screen,
  fireEvent,
  createReactConfig,
  mockEnvVars,
  vi
} from '@repo/testing/vitest';

// Ready to use directly
const { getByText } = render(<MyComponent />);
```

## Available Utilities

### React Testing Utilities

```typescript
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  act,
  cleanup,
  createReactConfig,
  MockAuthProvider
} from '@repo/testing/vitest';

// Example usage
test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Server Testing Utilities

```typescript
import {
  createServerConfig,
  mockRequest,
  mockResponse,
  mockNext,
} from '@repo/testing/vitest';

// Example usage
test('handles request', () => {
  const req = mockRequest({ body: { name: 'Test' } });
  const res = mockResponse();
  const next = mockNext;

  myHandler(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
});
```

### Shared Utilities

```typescript
import {
  mockEnvVars,
  setupConsoleMocks,
  mockDate,
  mockFetch,
  testEnvVars,
} from '@repo/testing/vitest';

// Example usage
test('uses environment variables', () => {
  const restore = mockEnvVars({ API_KEY: 'test-key' });

  // Test code that uses process.env.API_KEY

  restore(); // Restore original environment
});
```

### Vitest Functions

```typescript
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from '@repo/testing/vitest';

// Example usage
describe('My test suite', () => {
  beforeEach(() => {
    // Setup
  });

  it('does something', () => {
    const mock = vi.fn();
    expect(mock).not.toHaveBeenCalled();
  });
});
```

## Configuration Helpers

```typescript
import { getConfig } from '@repo/testing/vitest';

// In vitest.config.ts
export default getConfig.react({
  // Custom configuration options
});

// For server tests
export default getConfig.server({
  // Custom configuration options
});
```

## Internal Structure

The utilities are organized internally by function:

- `configs/`: Configuration utilities for different test environments
- `renderers/`: Component rendering utilities
- `mocks/`: Mock implementations for testing
- `templates/`: Test templates organized by framework
- `setup/`: Setup utilities for test environments
- `shared/`: Framework-agnostic utilities
- `frameworks/`: Framework-specific entry points

This organization ensures that the code is maintainable and follows the DRY
principle, while providing a simple and intuitive API for consumers.
