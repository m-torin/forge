# @repo/auth

Authentication package using Better Auth for the forge-ahead monorepo.

## Overview

This package provides authentication functionality using Better Auth with:

- Email/password authentication
- Session management with cookie caching
- Server-side and client-side auth utilities
- Pre-built React components
- Middleware for route protection

## Testing

We use Vitest for testing the auth package. Tests are located in the `__tests__` directory.

### Test Structure

```
packages/auth/
├── __tests__/
│   ├── middleware.test.ts    # Tests for auth middleware
│   ├── server.test.ts        # Tests for server-side auth functions
│   ├── sign-in.test.tsx      # Tests for SignIn component
│   └── sign-up.test.tsx      # Tests for SignUp component
├── test-setup.ts             # Test environment setup
└── vitest.config.ts          # Vitest configuration
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test --run

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Writing Tests

When writing tests for auth components and functions:

1. **Component Tests**: Use React Testing Library to test user interactions
2. **Server Function Tests**: Mock Better Auth and database dependencies
3. **Middleware Tests**: Test route protection and session validation

Example test structure:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);

    await user.click(screen.getByRole('button'));

    expect(/* assertion */).toBe(/* expected */);
  });
});
```

### Test Configuration

The package uses the following test configuration:

- **Environment**: jsdom for DOM testing
- **Setup**: Mocks for server-only modules, environment variables, and Next.js features
- **Coverage**: Configured through Vitest

### Common Test Patterns

1. **Mocking Better Auth**:

```typescript
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(),
    },
  })),
}));
```

2. **Mocking Server-Only Modules**:

```typescript
vi.mock('server-only', () => ({}));
```

3. **Testing Components with User Events**:

```typescript
const user = userEvent.setup();
await user.type(input, 'test value');
await user.click(button);
```

## Development

### Adding New Features

When adding new authentication features:

1. Create the feature in the appropriate file (server.ts, client.ts, or components/)
2. Write tests for the new feature
3. Update the documentation
4. Ensure all tests pass

### Best Practices

- Keep components simple and focused
- Use TypeScript for type safety
- Mock external dependencies in tests
- Test both success and error cases
- Use meaningful test descriptions

## Dependencies

- **better-auth**: Core authentication library
- **@testing-library/react**: React component testing
- **vitest**: Test runner and framework
- **@testing-library/user-event**: User interaction simulation
