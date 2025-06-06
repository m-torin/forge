# Vercel Toolbar + PostHog Integration Checklist

## ✅ Implementation Checklist

### 1. PostHog Adapter Implementation

- [x] **Client-side evaluation** using posthog-js
- [x] **Server-side evaluation** using posthog-node
- [x] **User identification** - automatically identifies users when entities.user.id is provided
- [x] **Origin metadata** - includes `{ provider: 'posthog' }` for Vercel Toolbar
- [x] **Report value config** - enables value reporting with `{ reportValue: true }`
- [x] **Error handling** - graceful fallback to default values on errors
- [x] **Singleton pattern** for server-side client to prevent multiple instances

### 2. Adapter Methods

- [x] **isFeatureEnabled()** - Returns boolean flags
- [x] **featureFlagValue()** - Returns string or boolean for multivariate flags
- [x] **featureFlagPayload()** - Returns JSON payloads with optional transform function

### 3. Discovery Endpoint

- [x] **createFlagsDiscoveryEndpoint()** - Generic endpoint creator
- [x] **getPostHogProviderData()** - Fetches flags from PostHog API
- [x] **Proper response format**:
  ```json
  {
    "provider": "posthog",
    "flags": [
      {
        "key": "flag-key",
        "options": [
          { "label": "Label", "value": value }
        ]
      }
    ]
  }
  ```
- [x] **Required headers**:
  - `Content-Type: application/json`
  - `Cache-Control: no-store, max-age=0`

### 4. Environment Variables

- [x] **Flag evaluation**:
  - `NEXT_PUBLIC_POSTHOG_KEY` or `POSTHOG_KEY`
  - `NEXT_PUBLIC_POSTHOG_HOST` or `POSTHOG_HOST` (optional)
- [x] **Discovery endpoint**:
  - `POSTHOG_PERSONAL_API_KEY`
  - `POSTHOG_PROJECT_ID`

### 5. Exports

- [x] **Server exports** (`@repo/feature-flags/server`):
  - `postHogAdapter` - Pre-configured adapter
  - `createPostHogAdapter` - Factory function
  - `getPostHogProviderData` - Provider data fetcher
  - `createFlagsDiscoveryEndpoint` - Endpoint creator
- [x] **Type exports**:
  - `PostHogAdapter` interface
  - `PostHogAdapterOptions` interface

### 6. Examples

- [x] **Basic usage** (`examples/posthog/flags.ts`)
- [x] **Complete example** (`examples/posthog/complete-example.tsx`)
- [x] **Discovery route** (`examples/posthog/discovery-route.ts`)
- [x] **Toolbar test** (`examples/posthog/vercel-toolbar-test.tsx`)

## 📋 Setup Instructions

### 1. Install the package

```bash
pnpm add @repo/feature-flags
```

### 2. Set environment variables

```bash
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=your-project-api-key
POSTHOG_PERSONAL_API_KEY=your-personal-api-key
POSTHOG_PROJECT_ID=your-project-id
```

### 3. Create discovery endpoint

Create `app/.well-known/vercel/flags/route.ts`:

```typescript
import { createFlagsDiscoveryEndpoint, getPostHogProviderData } from '@repo/feature-flags/server';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getPostHogProviderData({
    personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
    projectId: process.env.POSTHOG_PROJECT_ID,
  });
});
```

### 4. Define flags with PostHog adapter

```typescript
import { flag } from '@vercel/flags/next';
import { postHogAdapter } from '@repo/feature-flags/server';

export const myFlag = flag({
  key: 'my-posthog-flag',
  adapter: postHogAdapter.isFeatureEnabled(),
  identify,
});
```

### 5. Test with Vercel Toolbar

1. Deploy to Vercel or run with Vercel CLI
2. Open Vercel Toolbar
3. Navigate to Feature Flags section
4. Your PostHog flags should appear with override controls

## 🔍 Verification Steps

1. **Check discovery endpoint**:

   ```bash
   curl https://your-app.vercel.app/.well-known/vercel/flags
   ```

   Should return PostHog flags in correct format

2. **Verify toolbar integration**:

   - Flags appear in Vercel Toolbar
   - Can override flag values
   - Overrides persist during session

3. **Test flag evaluation**:
   - Server-side evaluation works
   - Client-side evaluation works
   - User identification works correctly

## ✨ Features

- **Full PostHog support**: All flag types (boolean, multivariate, payload)
- **User targeting**: Automatic user identification from entities
- **SSR/SSG compatible**: Works in all Next.js rendering modes
- **Type-safe**: Full TypeScript support with generics
- **Error resilient**: Graceful fallbacks on API failures
- **Performance optimized**: Singleton pattern, proper caching
- **Vercel Toolbar ready**: Complete integration with discovery endpoint
