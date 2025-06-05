# Multi-Provider Analytics System Design

This document outlines the design for a flexible, opt-in analytics provider system that supports
both client and server environments.

## Core Principles

1. **Opt-In Only**: All providers must be explicitly included in configuration
2. **Presence = Enabled**: If a provider is in the config, it's enabled (no `enabled: true` flag
   needed)
3. **Import-Based Runtime**: Client vs server capabilities determined by import path, not runtime
   detection
4. **Graceful Degradation**: Unavailable providers are silently ignored
5. **Shared Configuration**: Same config works for both client and server environments

## Architecture Overview

### Provider Registry - Environment Specific

```typescript
// Simple provider registry - no runtime complexity
const PROVIDER_REGISTRY = {
  segment: (config) => new SegmentProvider(config),
  posthog: (config) => new PostHogProvider(config),
  googleAnalytics: (config) => new GoogleAnalyticsProvider(config),
  mixpanel: (config) => new MixpanelProvider(config),
  amplitude: (config) => new AmplitudeProvider(config),
  console: (config) => new ConsoleProvider(config),
};
```

### Client vs Server Entry Points

#### Client Entry (`src/client.ts`)

```typescript
// Client providers - include browser-specific implementations
import { SegmentClientProvider } from './providers/segment-client';
import { PostHogClientProvider } from './providers/posthog-client';
import { GoogleAnalyticsProvider } from './providers/google-analytics';

const CLIENT_PROVIDERS = {
  segment: (config) => new SegmentClientProvider(config),
  posthog: (config) => new PostHogClientProvider(config),
  googleAnalytics: (config) => new GoogleAnalyticsProvider(config),
  console: (config) => new ConsoleProvider(config),
  // No mixpanel - doesn't work well on client
};

// Initialize with client-specific providers
const initializeAnalytics = (config) => {
  return createAnalyticsManager(config, CLIENT_PROVIDERS);
};

export * from './internal/emitters';
export { ecommerce } from './internal/emitters';
```

#### Server Entry (`src/server.ts`)

```typescript
// Server providers - include Node.js-specific implementations
import { SegmentServerProvider } from './providers/segment-server';
import { PostHogServerProvider } from './providers/posthog-server';
import { MixpanelServerProvider } from './providers/mixpanel-server';

const SERVER_PROVIDERS = {
  segment: (config) => new SegmentServerProvider(config),
  posthog: (config) => new PostHogServerProvider(config),
  mixpanel: (config) => new MixpanelServerProvider(config),
  amplitude: (config) => new AmplitudeServerProvider(config),
  console: (config) => new ConsoleProvider(config),
  // No googleAnalytics - doesn't make sense on server
};

// Initialize with server-specific providers
const initializeAnalytics = (config) => {
  return createAnalyticsManager(config, SERVER_PROVIDERS);
};

export * from './internal/emitters';
export { ecommerce } from './internal/emitters';
```

## Configuration System

### Clean Configuration - Presence = Enabled

```typescript
// Clean: presence = enabled
const analyticsConfig = {
  providers: {
    segment: {
      writeKey: process.env.SEGMENT_KEY,
    },
    posthog: {
      apiKey: process.env.POSTHOG_KEY,
      events: ['ecommerce', 'page_views'], // optional filtering
    },
    // googleAnalytics not present = not enabled
    // mixpanel not present = not enabled
  },
};
```

### Environment-Based Configuration

```typescript
const getAnalyticsConfig = () => {
  const providers: Record<string, any> = {};

  // Development - minimal providers
  if (process.env.NODE_ENV === 'development') {
    providers.console = {}; // just presence
    return { providers };
  }

  // Staging - selective providers
  if (process.env.NODE_ENV === 'staging') {
    providers.posthog = {
      apiKey: process.env.POSTHOG_KEY,
    };
    return { providers };
  }

  // Production - multiple providers
  providers.segment = {
    writeKey: process.env.SEGMENT_KEY,
  };

  providers.posthog = {
    apiKey: process.env.POSTHOG_KEY,
  };

  if (process.env.GA_MEASUREMENT_ID) {
    providers.googleAnalytics = {
      measurementId: process.env.GA_MEASUREMENT_ID,
    };
  }

  return { providers };
};
```

### Conditional Provider Inclusion

```typescript
const buildConfig = async () => {
  const providers: Record<string, any> = {};

  // Always include core provider
  providers.segment = {
    writeKey: process.env.SEGMENT_KEY,
  };

  // Conditionally include based on feature flags
  if (await getFeatureFlag('enable_posthog')) {
    providers.posthog = {
      apiKey: process.env.POSTHOG_KEY,
    };
  }

  // Conditionally include based on environment variables
  if (process.env.AMPLITUDE_API_KEY) {
    providers.amplitude = {
      apiKey: process.env.AMPLITUDE_API_KEY,
    };
  }

  return { providers };
};
```

## Provider Interface

### Standard Provider Contract

```typescript
interface ProviderConfig {
  // Provider-specific required fields
  apiKey?: string;
  writeKey?: string;
  measurementId?: string;

  // Optional configuration
  events?: string[] | 'all';
  options?: Record<string, any>;

  // No 'enabled' field - presence = enabled
}

interface AnalyticsProvider {
  readonly name: string;

  initialize(config: ProviderConfig): Promise<void>;
  track(event: string, properties: any): Promise<void>;

  // Optional methods
  identify?(userId: string, traits: any): Promise<void>;
  page?(name: string, properties: any): Promise<void>;
}
```

### Provider Manager - Simple Filtering

```typescript
const createAnalyticsManager = (config: AnalyticsConfig, availableProviders: ProviderRegistry) => {
  const activeProviders = new Map();

  for (const [name, providerConfig] of Object.entries(config.providers)) {
    const providerFactory = availableProviders[name];

    if (providerFactory) {
      try {
        const provider = providerFactory(providerConfig);
        activeProviders.set(name, provider);
      } catch (error) {
        console.warn(`Failed to initialize provider '${name}':`, error);
      }
    } else {
      // Provider not available in this environment - silently skip
      console.debug(`Provider '${name}' not available in this environment`);
    }
  }

  return new AnalyticsManager(activeProviders);
};
```

## Event-Level Provider Control

```typescript
// Override: add providers not in global config
track('Special Event', properties, {
  providers: {
    // Add one-off provider
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN,
    },
  },
});

// Or use shorthand for configured providers only
track('Product Viewed', properties, {
  only: ['segment'], // only send to segment, ignore others
});

track('Internal Event', properties, {
  exclude: ['googleAnalytics'], // send to all except GA
});
```

## Provider Implementations

### Environment-Specific Providers

#### Segment Client Provider

```typescript
// providers/segment-client.ts
export class SegmentClientProvider implements AnalyticsProvider {
  constructor(private config: { writeKey: string }) {}

  async initialize() {
    // Load Segment browser SDK
    const analytics = window.analytics || [];
    analytics.load(this.config.writeKey);
    window.analytics = analytics;
  }

  async track(event: string, properties: any) {
    window.analytics?.track(event, properties);
  }
}
```

#### Segment Server Provider

```typescript
// providers/segment-server.ts
import { Analytics } from '@segment/analytics-node';

export class SegmentServerProvider implements AnalyticsProvider {
  private client: Analytics;

  constructor(private config: { writeKey: string }) {
    this.client = new Analytics({ writeKey: config.writeKey });
  }

  async track(event: string, properties: any) {
    this.client.track({ event, properties });
  }
}
```

## Validation

### Configuration Validation

```typescript
const validateConfig = (config: AnalyticsConfig) => {
  const requirements = {
    segment: ['writeKey'],
    posthog: ['apiKey'],
    googleAnalytics: ['measurementId'],
    amplitude: ['apiKey'],
    mixpanel: ['token'],
  };

  for (const [providerName, providerConfig] of Object.entries(config.providers)) {
    const requiredFields = requirements[providerName] || [];

    for (const field of requiredFields) {
      if (!providerConfig[field]) {
        throw new Error(
          `Provider '${providerName}' missing required field '${field}'. ` +
            `Remove the provider from config or provide the required field.`
        );
      }
    }
  }
};
```

## Usage Examples

### Shared Configuration

```typescript
// Same config for both client and server
export const analyticsConfig = {
  providers: {
    segment: {
      writeKey: process.env.SEGMENT_KEY,
    },
    posthog: {
      apiKey: process.env.POSTHOG_KEY,
    },
    googleAnalytics: {
      measurementId: process.env.GA_MEASUREMENT_ID,
      // Will work on client, ignored on server (not in SERVER_PROVIDERS)
    },
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN,
      // Will work on server, ignored on client (not in CLIENT_PROVIDERS)
    },
  },
};
```

### Import-Based Usage

```typescript
// Client-side usage
import { track, ecommerce } from '@repo/analytics';
// Available providers: segment, posthog, googleAnalytics, console

track('Button Clicked', { button: 'signup' });

// Server-side usage
import { track, ecommerce } from '@repo/analytics/server';
// Available providers: segment, posthog, mixpanel, amplitude, console

track('API Called', { endpoint: '/users' });
```

### Environment-Specific Examples

#### Minimal Development Setup

```typescript
export const analyticsConfig = {
  providers: {
    console: {}, // just log to console
  },
};
```

#### Production Multi-Provider

```typescript
export const analyticsConfig = {
  providers: {
    segment: {
      writeKey: process.env.SEGMENT_WRITE_KEY,
    },

    posthog: {
      apiKey: process.env.POSTHOG_API_KEY,
      events: ['ecommerce', 'feature_flags'], // optional filtering
    },

    googleAnalytics: {
      measurementId: process.env.GA_MEASUREMENT_ID,
      events: ['page_views', 'conversions'],
    },
  },
};
```

#### Feature Flag Controlled

```typescript
const buildAnalyticsConfig = async () => {
  const providers: Record<string, any> = {
    // Always enabled
    segment: {
      writeKey: process.env.SEGMENT_KEY,
    },
  };

  // Conditionally add providers
  if (await getFeatureFlag('enable_posthog')) {
    providers.posthog = {
      apiKey: process.env.POSTHOG_KEY,
    };
  }

  if (await getFeatureFlag('enable_amplitude')) {
    providers.amplitude = {
      apiKey: process.env.AMPLITUDE_KEY,
    };
  }

  return { providers };
};
```

## Implementation Structure

```
src/
├── client.ts                  # Client exports + CLIENT_PROVIDERS
├── server.ts                  # Server exports + SERVER_PROVIDERS
├── external/
│   ├── types.ts              # Core provider interfaces and types
│   ├── manager.ts            # AnalyticsManager orchestration
│   ├── config.ts             # Configuration utilities and builders
│   ├── validation.ts         # Configuration validation
│   ├── segment/
│   │   ├── types.ts          # Segment-specific types
│   │   ├── client.ts         # Browser Segment implementation
│   │   └── server.ts         # Node.js Segment implementation
│   ├── posthog/
│   │   ├── types.ts          # PostHog-specific types
│   │   ├── client.ts         # Browser PostHog implementation
│   │   └── server.ts         # Node.js PostHog implementation
│   ├── vercel/
│   │   ├── types.ts          # Vercel Analytics types
│   │   ├── client.ts         # Browser Vercel Analytics
│   │   └── server.ts         # Server Vercel Analytics (limited)
│   └── console/
│       ├── types.ts          # Console provider types
│       └── universal.ts      # Universal console implementation
└── internal/emitters/
    └── ecommerce/             # Ecommerce event system
```

## Benefits

1. **🎯 Explicit Choice**: Import path makes runtime clear
2. **🧹 Simple Registry**: No runtime complexity in provider definitions
3. **📦 Optimal Bundles**: Client doesn't include server code, vice versa
4. **🔄 Shared Config**: Same config works for both environments
5. **🛡️ Graceful Degradation**: Unavailable providers silently ignored
6. **💡 Clear Separation**: Environment-specific provider implementations
7. **🔒 Security by Default**: No accidental data leaks
8. **💰 Cost Control**: No surprise analytics bills
9. **📋 Compliance Friendly**: Explicit data flow decisions
10. **🐛 Easier Debugging**: Clear provider responsibility

## Implementation Status

✅ **COMPLETE**: All core functionality implemented

### Implemented Features

1. ✅ **Core Provider System**: Provider detection by presence in config
2. ✅ **Validation**: Comprehensive configuration validation with error reporting
3. ✅ **Environment Separation**: Client/server specific provider registries
4. ✅ **Provider Implementations**: Segment, PostHog, Vercel, Console providers
5. ✅ **Analytics Manager**: Multi-provider orchestration with error handling
6. ✅ **Configuration Utilities**: Builders and helpers for all environments
7. ✅ **Event Filtering**: Provider filtering (only/exclude) per event
8. ✅ **Context Management**: Global analytics context with user/organization data
9. ✅ **Graceful Degradation**: Failed providers don't break the system
10. ✅ **TypeScript Support**: Full type safety for all providers and events

### Usage Examples (Final Implementation)

#### Basic Initialization

```typescript
// Client-side
import { initializeAnalytics, track, getAnalyticsConfig } from '@repo/analytics';

const config = getAnalyticsConfig(); // Environment-based config
await initializeAnalytics(config);

// Track events
track('Button Clicked', { button: 'signup' });

// Server-side
import { initializeAnalytics, track } from '@repo/analytics/server';

const config = {
  providers: {
    segment: { writeKey: process.env.SEGMENT_WRITE_KEY },
    console: { prefix: '[Server Analytics]' },
  },
};

await initializeAnalytics(config);
track('API Called', { endpoint: '/users' });
```

#### Advanced Configuration

```typescript
import { createConfigBuilder, validateConfigOrThrow } from '@repo/analytics';

const config = createConfigBuilder()
  .addSegment(process.env.SEGMENT_WRITE_KEY!)
  .addPostHog(process.env.POSTHOG_API_KEY!)
  .addVercel()
  .addConsole({ pretty: true })
  .build();

// Validate before use
validateConfigOrThrow(config);

await initializeAnalytics(config);
```

#### Event-Level Provider Control

```typescript
// Send to specific providers only
track('Sensitive Event', properties, {
  only: ['segment'], // Only send to Segment
});

// Exclude specific providers
track('Internal Metric', properties, {
  exclude: ['vercel'], // Send to all except Vercel
});

// Add runtime provider
track('Special Event', properties, {
  providers: {
    console: { prefix: '[Special]' },
  },
});
```

### Dependencies Required

To use the providers, install the following packages:

```bash
# For Segment (universal - works in both browser and Node.js)
npm install @segment/analytics-next

# For PostHog
npm install posthog-js posthog-node

# For Vercel Analytics
npm install @vercel/analytics

# Console provider requires no dependencies
```

### Segment Provider Notes

The Segment provider now uses `@segment/analytics-next` for both client and server environments:

- **Client**: Uses `AnalyticsBrowser.load()` for browser environments
- **Server**: Uses `new Analytics({ flushAt: 1 })` for immediate server-side delivery
- **Universal**: Single package supports Node.js, Edge Functions, Web Workers, and browsers
- **Cloud destinations only**: Server-side usage only supports cloud destinations (not device mode)
