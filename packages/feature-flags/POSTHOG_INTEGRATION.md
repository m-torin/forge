# PostHog Feature Flags Integration

This package now supports PostHog as a feature flag provider through custom adapters.

## What's Included

### 1. PostHog Adapter (`src/adapters/posthog.ts`)

- Full client and server-side support using posthog-js and posthog-node
- Three adapter methods:
  - `isFeatureEnabled()` - Boolean flags
  - `featureFlagValue()` - String/boolean multivariate flags
  - `featureFlagPayload()` - JSON payload flags with optional transform

### 2. Discovery Endpoint Support (`src/discovery/index.ts`)

- Creates endpoints for Vercel Toolbar integration
- `getPostHogProviderData()` fetches flags from PostHog API
- Transforms PostHog flags to Vercel Flags format

### 3. Complete Examples

- `examples/posthog/flags.ts` - Basic usage examples
- `examples/posthog/complete-example.tsx` - Comprehensive examples with all flag types
- `examples/posthog/discovery-route.ts` - Discovery endpoint setup

## Environment Variables

```bash
# For flag evaluation
NEXT_PUBLIC_POSTHOG_KEY=your-project-api-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com # optional

# For discovery endpoint (optional)
POSTHOG_PERSONAL_API_KEY=your-personal-api-key
POSTHOG_PROJECT_ID=your-project-id
```

## Usage

```typescript
import { flag } from '@vercel/flags/next';
import { postHogAdapter } from '@repo/feature-flags/server';

export const myFlag = flag({
  key: 'my-posthog-flag',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify,
});
```

## Features

- ✅ Server-side evaluation with posthog-node
- ✅ Client-side evaluation with posthog-js
- ✅ Automatic PostHog initialization
- ✅ Support for all PostHog flag types (boolean, multivariate, payload)
- ✅ Type-safe adapter implementation
- ✅ Vercel Toolbar integration via discovery endpoint
- ✅ Singleton pattern for server-side client
- ✅ Error handling with fallback to default values
