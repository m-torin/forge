# Analytics Package

This package provides a unified analytics integration for the forge-ahead project, combining
PostHog, Google Analytics, and Vercel Analytics.

## Features

- **PostHog Integration**: Client and server-side analytics with session tracking
- **Google Analytics**: Optional GA4 support when measurement ID is provided
- **Vercel Analytics**: Automatic web vitals and performance tracking
- **TypeScript Support**: Fully typed with environment validation
- **React Integration**: Easy-to-use React components and hooks

## Usage

### Client Components

```tsx
import { AnalyticsProvider, useAnalytics } from '@repo/analytics';

// Wrap your app with the provider
export function App({ children }) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}

// Use analytics in components
export function MyComponent() {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.capture('button_clicked', {
      button_name: 'submit',
    });
  };

  return <button onClick={handleClick}>Submit</button>;
}
```

### Server-Side Analytics

```typescript
import { analytics } from '@repo/analytics/server';

// Track server-side events
analytics.capture({
  distinctId: userId,
  event: 'api_called',
  properties: {
    endpoint: '/api/users',
    method: 'GET',
  },
});

// Identify users
analytics.identify({
  distinctId: userId,
  properties: {
    email: user.email,
    plan: user.plan,
  },
});
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

Optional environment variables:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-YOUR_GA_ID
```

## Testing

The package includes comprehensive test coverage:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Development

When developing this package:

1. Make sure all environment variables are set
2. Run tests after making changes
3. Update this README if adding new features
4. Follow the existing code patterns for consistency

## Architecture

The package is structured as follows:

- `index.tsx` - Main entry point with AnalyticsProvider component
- `keys.ts` - Environment variable validation using @t3-oss/env-nextjs
- `posthog/` - PostHog client and server implementations
- `google.ts` - Google Analytics integration
- `vercel.ts` - Vercel Analytics integration
- `__tests__/` - Comprehensive test suite

## License

Part of the forge-ahead project.
