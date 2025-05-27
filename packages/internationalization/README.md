# @repo/internationalization

Internationalization package for the forge-ahead monorepo using next-international and languine.

## Overview

This package provides internationalization functionality with:

- Multi-language support (English, Spanish, French, German, Portuguese, Chinese)
- Automatic locale detection from browser preferences
- Type-safe translation keys
- Middleware for Next.js App Router
- Integration with Languine for translation management

## Usage

### Server Components

```typescript
import { getDictionary } from '@repo/internationalization';

export default async function Page({ params: { locale } }) {
  const dict = await getDictionary(locale);

  return <h1>{dict.welcome}</h1>;
}
```

### Middleware

```typescript
import { internationalizationMiddleware } from '@repo/internationalization/middleware';

export function middleware(request: NextRequest) {
  return internationalizationMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Available Locales

```typescript
import { locales } from '@repo/internationalization';
// ['en', 'es', 'fr', 'de', 'pt', 'zh']
```

## Testing

This package uses Vitest for testing. Tests are located in the `__tests__` directory.

### Test Structure

```
packages/internationalization/
├── __tests__/
│   ├── config.test.ts      # Tests for languine configuration
│   ├── index.test.ts       # Tests for getDictionary and locales
│   ├── middleware.test.ts  # Tests for middleware functionality
│   └── types.test.ts       # Tests for type exports
├── test-setup.ts           # Test environment setup
└── vitest.config.ts        # Vitest configuration
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

### Writing Tests

When writing tests for internationalization:

1. **Dictionary Loading**: Test locale resolution and fallback behavior
2. **Middleware**: Test request handling and locale detection
3. **Configuration**: Verify languine setup and locale consistency

Example test:

```typescript
import { describe, it, expect } from 'vitest';
import { getDictionary } from '../index';

describe('getDictionary', () => {
  it('returns dictionary for valid locale', async () => {
    const dictionary = await getDictionary('en');
    expect(dictionary).toBeDefined();
  });

  it('falls back to English for unsupported locale', async () => {
    const dictionary = await getDictionary('invalid');
    expect(dictionary).toBeDefined();
  });
});
```

### Test Configuration

The package uses:

- **Environment**: Node.js for server-side testing
- **Mocks**: Server-only modules and languine configuration
- **Setup**: Mock dictionaries and environment variables

### Common Test Patterns

1. **Mocking Dictionaries**:

```typescript
vi.mock('../dictionaries/en.json', () => ({
  default: { hello: 'Hello', welcome: 'Welcome' },
}));
```

2. **Testing Middleware**:

```typescript
const mockRequest = new NextRequest('http://localhost:3000/');
const result = internationalizationMiddleware(mockRequest);
```

3. **Testing Locale Fallback**:

```typescript
const dictionary = await getDictionary('unsupported-locale');
expect(dictionary).toEqual(englishDictionary);
```

## Configuration

### Languine Setup

The package uses Languine for translation management. Configuration is in `languine.json`:

```json
{
  "locale": {
    "source": "en",
    "targets": ["es", "fr", "de", "pt", "zh"]
  }
}
```

### Environment Variables

Required for Languine translations:

- `DEEPSEEK_API_KEY`: API key for translation service

## Adding New Languages

1. Update `languine.json` with the new target locale
2. Run `pnpm translate` to generate translations
3. Update tests to include the new locale
4. Rebuild the package

## Development

### Commands

- `pnpm translate`: Generate translations using Languine
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm test`: Run tests
- `pnpm clean`: Clean build artifacts

### Best Practices

- Always test dictionary loading for new locales
- Verify middleware behavior with different Accept-Language headers
- Keep translations up-to-date with source content
- Test fallback behavior for missing translations
