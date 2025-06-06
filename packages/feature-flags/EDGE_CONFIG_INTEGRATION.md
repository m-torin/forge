# Edge Config Feature Flags Integration

This package now supports Vercel Edge Config as a feature flag provider for ultra-low latency flag
evaluation.

## What's Included

### 1. Edge Config Adapter (`src/adapters/edge-config.ts`)

- Simple adapter that reads flags from Edge Config
- Support for custom Edge Config clients
- Configurable item keys (defaults to 'flags')
- Type-safe implementation with TypeScript

### 2. Discovery Endpoint Support

- `getEdgeConfigProviderData()` fetches all flags from Edge Config
- Transforms flags to Vercel Flags format
- Automatic type detection for flag options

### 3. Complete Examples

- `examples/edge-config/flags.ts` - Basic usage examples
- `examples/edge-config/custom-adapter.ts` - Advanced configurations
- `examples/edge-config/discovery-route.ts` - Discovery endpoint setup
- `examples/edge-config/migration-example.ts` - Migration strategies
- `examples/edge-config/edge-config-structure.json` - Example Edge Config structure

## Environment Variables

```bash
# Edge Config connection string
EDGE_CONFIG=your-edge-config-connection-string

# Optional: Additional Edge Configs
OTHER_EDGE_CONFIG=another-connection-string
STAGING_EDGE_CONFIG=staging-connection-string
PRODUCTION_EDGE_CONFIG=production-connection-string
```

## Usage

### Basic Usage

```typescript
import { flag } from '@vercel/flags/next';
import { edgeConfigAdapter } from '@repo/feature-flags/server';

export const myFlag = flag({
  key: 'my-edge-config-flag',
  adapter: edgeConfigAdapter(),
});
```

### Custom Configuration

```typescript
import { createEdgeConfigAdapter } from '@repo/feature-flags/server';

const adapter = createEdgeConfigAdapter({
  connectionString: process.env.CUSTOM_EDGE_CONFIG,
  options: {
    edgeConfigItemKey: 'feature-flags', // default is 'flags'
    teamSlug: 'my-team', // for Vercel dashboard links
  },
});
```

## Edge Config Structure

Your Edge Config should have this structure:

```json
{
  "flags": {
    "boolean-flag": true,
    "string-flag": "variant-a",
    "number-flag": 0.5,
    "object-flag": {
      "enabled": true,
      "config": { "maxUsers": 100 }
    }
  }
}
```

## Features

- ✅ Simple key-value flag storage
- ✅ Support for all JSON-serializable types
- ✅ Ultra-low latency (globally distributed)
- ✅ No cold starts (data at the edge)
- ✅ Vercel dashboard management
- ✅ Version control and rollback
- ✅ Vercel Toolbar integration
- ✅ Type-safe with TypeScript

## Benefits over Other Providers

1. **Performance**: Edge Config is globally distributed with ultra-low latency
2. **Simplicity**: No external API calls, data is available at the edge
3. **Integration**: Native Vercel integration with dashboard management
4. **Cost**: Included with Vercel plans, no additional provider costs
5. **Reliability**: No external dependencies or API rate limits

## When to Use Edge Config

Edge Config is ideal for:

- Simple boolean or string flags
- Flags that change infrequently
- Global feature rollouts
- A/B test variants
- Configuration values

## Limitations

- Maximum 512KB per Edge Config
- JSON-serializable values only
- No complex targeting rules (use PostHog for that)
- No built-in analytics (combine with analytics package)

## Migration from Other Providers

The adapter supports gradual migration:

```typescript
export const migratedFlag = flag({
  key: 'my-flag',
  adapter: edgeConfigAdapter(),
  decide: async () => {
    // Fallback if not in Edge Config
    return oldProvider.getFlag('my-flag');
  },
});
```
