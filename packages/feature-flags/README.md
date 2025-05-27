# @repo/feature-flags

A feature flag management package that integrates with PostHog analytics for user-based feature
toggles, with optional Vercel Toolbar integration for development environments.

## Overview

This package provides a simple yet powerful way to implement feature flags in your Next.js
application. It allows you to control feature visibility on a per-user basis through PostHog
integration, while also supporting the Vercel Feature Flags Toolbar for easy development and
testing.

## Installation

```bash
pnpm add @repo/feature-flags
```

## Required Dependencies

This package requires the following peer dependencies:

- `next` (^15.0.0)

The package also depends on:

- `@repo/analytics` - For PostHog integration
- `@repo/auth` - For user authentication
- `@vercel/toolbar` - For development toolbar
- `flags` - For flag definitions

## Usage

### Creating Feature Flags

```typescript
import { createFlag } from '@repo/feature-flags/lib/create-flag';

// Create a new feature flag
export const showNewFeature = createFlag('show-new-feature');
```

### Using Feature Flags in Components

```typescript
import { showBetaFeature } from '@repo/feature-flags';

export async function MyComponent() {
  const isEnabled = await showBetaFeature();

  if (isEnabled) {
    return <BetaFeature />;
  }

  return <RegularFeature />;
}
```

### API Access Handler

Create an API route to expose flag definitions:

```typescript
// app/api/flags/route.ts
import { getFlags } from '@repo/feature-flags/access';

export async function GET(request: Request) {
  return getFlags(request);
}
```

### Vercel Toolbar Integration

#### Adding the Toolbar Component

```tsx
import { Toolbar } from '@repo/feature-flags/components/toolbar';

export function Layout({ children }) {
  return (
    <>
      {children}
      <Toolbar />
    </>
  );
}
```

#### Next.js Config Integration

Wrap your Next.js configuration to enable the Vercel Toolbar:

```javascript
// next.config.js
import { withToolbar } from '@repo/feature-flags/lib/toolbar';

const nextConfig = {
  // Your existing config
};

export default withToolbar(nextConfig);
```

## Environment Variables

The package uses environment variables configured through `@repo/feature-flags/keys`:

- `FLAGS_SECRET` - Optional secret for Vercel Toolbar integration. When set, enables the development
  toolbar for managing feature flags.

## Architecture

### Components

1. **Flag Creation (`lib/create-flag.ts`)**

   - Creates feature flags using the `flags` package
   - Integrates with PostHog for user-based evaluation
   - Uses current user context from auth package

2. **Access Control (`access.ts`)**

   - Provides authenticated API access to flag definitions
   - Verifies authorization before exposing flag metadata
   - Returns flag configurations for the toolbar

3. **Vercel Toolbar (`components/toolbar.tsx`)**

   - Renders the Vercel Toolbar when `FLAGS_SECRET` is configured
   - Provides UI for managing flags during development
   - Automatically hidden in production

4. **Configuration Helper (`lib/toolbar.ts`)**
   - Wraps Next.js config with toolbar functionality
   - Only applies when `FLAGS_SECRET` is present
   - Maintains compatibility with existing configurations

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

### Test Structure

- Unit tests for all modules
- Integration tests for the complete package
- Mock implementations for external dependencies
- Error handling and edge case coverage

## Examples

### Basic Feature Flag

```typescript
// flags/index.ts
import { createFlag } from '@repo/feature-flags/lib/create-flag';

export const showBetaFeature = createFlag('show-beta-feature');

// component.tsx
import { showBetaFeature } from './flags';

export async function FeatureComponent() {
  if (await showBetaFeature()) {
    return <BetaVersion />;
  }
  return <StableVersion />;
}
```

### Conditional Rendering with Flags

```typescript
export async function Dashboard() {
  const showAnalytics = await showAnalyticsFeature();
  const showReporting = await showReportingFeature();

  return (
    <div>
      <MainContent />
      {showAnalytics && <AnalyticsPanel />}
      {showReporting && <ReportingSection />}
    </div>
  );
}
```

### Protected API Route with Flags

```typescript
export async function GET(request: Request) {
  const flags = await getFlags(request);

  if (!flags) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Return flag definitions
  return flags;
}
```

## Best Practices

1. **Flag Naming Convention**

   - Use descriptive names (e.g., `show-new-checkout-flow`)
   - Use kebab-case for consistency
   - Prefix with feature area when applicable

2. **User Context**

   - Flags are evaluated per user
   - Ensure proper authentication is in place
   - Handle missing user context gracefully

3. **Performance**

   - Flag evaluations are cached per request
   - Minimize the number of flag checks
   - Consider using React Suspense for async flags

4. **Development**
   - Use Vercel Toolbar for easy flag management
   - Test with different flag states
   - Document flag purpose and removal timeline

## Security

- Flag definitions are protected by authentication
- API access requires valid authorization headers
- Toolbar only available when `FLAGS_SECRET` is configured
- User context is properly isolated

## Troubleshooting

### Flags Not Working

1. Verify PostHog is properly configured
2. Check user authentication is working
3. Ensure flag exists in PostHog dashboard
4. Verify flag key matches exactly

### Toolbar Not Showing

1. Check `FLAGS_SECRET` environment variable is set
2. Verify `withToolbar` is applied to Next.js config
3. Ensure Toolbar component is rendered in layout
4. Check browser console for errors

## License

This package is part of the forge-ahead monorepo and follows the same license terms.
