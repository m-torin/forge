# Security Package

This package provides security features for the application, including bot detection and rate
limiting using Arcjet, and security headers using Nosecone.

## Features

- **Bot Detection**: Detect and block unwanted bots while allowing legitimate crawlers
- **Rate Limiting**: Protect against abuse with configurable rate limits
- **Security Headers**: Apply security headers using Nosecone
- **Environment Configuration**: Type-safe environment variable management

## Installation

```bash
pnpm add @repo/security
```

## Usage

### Basic Security

```typescript
import { secure } from '@repo/security';

// Allow specific bots, block all others
await secure(['GOOGLE', 'BING']);
```

### Security Headers Middleware

```typescript
import { noseconeMiddleware, noseconeOptions } from '@repo/security';

// Use in Next.js middleware
export default noseconeMiddleware(request, noseconeOptions);
```

### Environment Variables

Required environment variables:

- `ARCJET_KEY`: Your Arcjet API key (optional, but required for security features)

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test -- --watch
```

### Test Structure

```
__tests__/
├── index.test.ts      # Tests for main security functions
├── keys.test.ts       # Tests for environment configuration
└── middleware.test.ts # Tests for nosecone middleware
```

### Test Coverage

The package aims for high test coverage:

- Unit tests for all public functions
- Mock external dependencies (Arcjet, Nosecone)
- Environment variable validation tests
- Error handling scenarios

### Writing Tests

When adding new features, ensure to:

1. Add corresponding test files
2. Mock external dependencies
3. Test both success and error cases
4. Validate environment configurations

Example test:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { yourFunction } from '../your-module';

describe('yourFunction', () => {
  it('should handle success case', () => {
    // Test implementation
  });

  it('should handle error case', () => {
    // Test error scenarios
  });
});
```

### Mocking

The test setup includes mocks for:

- `@arcjet/next` - Bot detection and rate limiting
- `@nosecone/next` - Security headers
- Environment variables through `process.env`

## Development

### Adding New Features

1. Add your feature implementation
2. Add corresponding tests
3. Update this README
4. Run tests to ensure everything passes

### Type Safety

This package uses TypeScript for type safety. Run type checking:

```bash
pnpm typecheck
```

## License

Private - See repository root for license information.
