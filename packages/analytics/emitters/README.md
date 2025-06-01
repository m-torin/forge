# Universal Analytics Emitters

A universal analytics library based on Segment's specification that works seamlessly across frontend and backend environments.

## Features

- 🌐 **Universal**: Works in both browser and Node.js environments
- 📊 **Multi-Provider**: Support for Segment, PostHog, Google Analytics, and more
- 🔄 **Unified API**: Consistent interface based on Segment's 5 core methods
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive types
- 🚀 **Performance**: Automatic batching and flushing
- 🔌 **Extensible**: Easy to add new analytics providers

## Installation

```bash
npm install @repo/analytics
# or
pnpm add @repo/analytics
```

## Quick Start

```typescript
import { Analytics } from '@repo/analytics/emitters';

// Initialize analytics with your providers
const analytics = new Analytics({
  providers: {
    segment: {
      writeKey: 'YOUR_SEGMENT_WRITE_KEY',
    },
    posthog: {
      apiKey: 'YOUR_POSTHOG_API_KEY',
    },
    googleAnalytics: {
      measurementId: 'YOUR_GA_MEASUREMENT_ID',
    },
  },
  debug: true, // Enable debug logging
});

// Identify a user
await analytics.identify('user-123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium',
});

// Track an event
await analytics.track('Button Clicked', {
  button: 'Sign Up',
  location: 'Header',
});

// Track a page view (web)
await analytics.page('Home', 'Landing Page', {
  referrer: 'google.com',
});

// Track a screen view (mobile/app)
await analytics.screen('Navigation', 'Product Detail', {
  productId: 'prod-123',
  category: 'Electronics',
});
```

## Core Methods

Based on Segment's specification, the library provides 6 core methods:

### 1. Identify

Associates users with traits.

```typescript
await analytics.identify(userId, traits, options);
```

### 2. Track

Records user actions.

```typescript
await analytics.track(event, properties, options);
```

### 3. Page

Records page views (web).

```typescript
await analytics.page(category, name, properties, options);
```

### 4. Screen

Records screen views (mobile/app).

```typescript
await analytics.screen(category, name, properties, options);
```

### 5. Group

Associates users with groups.

```typescript
await analytics.group(groupId, traits, options);
```

### 6. Alias

Creates an alias for a user.

```typescript
await analytics.alias(newUserId, previousId, options);
```

## Advanced Usage

### Server-Side Usage (Node.js)

```typescript
import { Analytics } from '@repo/analytics/emitters';

const analytics = new Analytics({
  providers: {
    segment: {
      writeKey: process.env.SEGMENT_WRITE_KEY!,
      config: {
        flushAt: 20, // Flush after 20 events
        flushInterval: 10000, // Flush every 10 seconds
      },
    },
  },
});

// Track server-side events
await analytics.track('Order Completed', {
  orderId: 'order-123',
  revenue: 99.99,
  currency: 'USD',
});

// Ensure all events are sent before process exits
await analytics.flush();
```

### Client-Side Usage (React Web)

```typescript
import { useEffect } from 'react';
import { Analytics } from '@repo/analytics/emitters';

const analytics = new Analytics({
  providers: {
    googleAnalytics: {
      measurementId: 'G-XXXXXXXXXX',
    },
    posthog: {
      apiKey: 'phc_xxxxxxxxxx',
    },
  },
});

function App() {
  useEffect(() => {
    // Track page view on mount
    analytics.page();
  }, []);

  const handleButtonClick = () => {
    analytics.track('CTA Clicked', {
      location: 'hero',
      text: 'Get Started',
    });
  };

  return (
    <button onClick={handleButtonClick}>
      Get Started
    </button>
  );
}
```

### Mobile App Usage (React Native)

```typescript
import { useEffect } from 'react';
import { Analytics } from '@repo/analytics/emitters';

const analytics = new Analytics({
  providers: {
    segment: {
      writeKey: 'your-segment-key',
    },
    posthog: {
      apiKey: 'phc_xxxxxxxxxx',
    },
  },
});

function ProductScreen() {
  useEffect(() => {
    // Track screen view on mount
    analytics.screen('Products', 'Product Detail', {
      productId: 'prod-123',
      category: 'Electronics',
    });
  }, []);

  const handlePurchase = () => {
    analytics.track('Product Purchased', {
      productId: 'prod-123',
      price: 99.99,
      currency: 'USD',
    });
  };

  return (
    <View>
      <Button onPress={handlePurchase} title="Buy Now" />
    </View>
  );
}
```

### Using Individual Emitters

You can also use emitters directly:

```typescript
import { SegmentEmitter } from '@repo/analytics/emitters/segment';
import { PostHogEmitter } from '@repo/analytics/emitters/posthog';

// Use Segment directly
const segment = new SegmentEmitter({
  writeKey: 'YOUR_WRITE_KEY',
  debug: true,
});

await segment.track({
  userId: 'user-123',
  event: 'Product Viewed',
  properties: {
    productId: 'prod-456',
    price: 29.99,
  },
});

// Use PostHog directly
const posthog = new PostHogEmitter({
  apiKey: 'YOUR_API_KEY',
});

await posthog.identify({
  userId: 'user-123',
  traits: {
    plan: 'premium',
  },
});
```

### Multi-Emitter for Custom Combinations

```typescript
import { MultiEmitter, SegmentEmitter, PostHogEmitter } from '@repo/analytics/emitters';

const multiEmitter = new MultiEmitter([
  new SegmentEmitter({ writeKey: 'xxx' }),
  new PostHogEmitter({ apiKey: 'yyy' }),
]);

// Events are sent to all emitters
await multiEmitter.track({
  userId: 'user-123',
  event: 'Feature Used',
  properties: { feature: 'Export' },
});
```

## Configuration Options

### Analytics Options

```typescript
interface AnalyticsOptions {
  providers?: {
    segment?: {
      writeKey: string;
      config?: AnalyticsConfig;
    };
    posthog?: {
      apiKey: string;
      config?: AnalyticsConfig;
    };
    googleAnalytics?: {
      measurementId: string;
      config?: AnalyticsConfig;
    };
  };
  debug?: boolean;
  disabled?: boolean;
  defaultUserId?: string;
  defaultAnonymousId?: string;
}
```

### Provider Config

```typescript
interface AnalyticsConfig {
  apiHost?: string;
  flushAt?: number; // Number of events before auto-flush
  flushInterval?: number; // Milliseconds between auto-flushes
  debug?: boolean;
  disabled?: boolean;
}
```

## Context and Options

All methods accept additional context and options:

```typescript
await analytics.track('Event Name', properties, {
  context: {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    locale: 'en-US',
    page: {
      url: 'https://example.com/products',
      referrer: 'https://google.com',
    },
  },
  timestamp: new Date('2023-12-01'),
  integrations: {
    Segment: true,
    'Google Analytics': false, // Disable for specific providers
  },
});
```

## Best Practices

1. **Initialize Once**: Create a single analytics instance and reuse it
2. **User Identification**: Call `identify` when users log in
3. **Anonymous Tracking**: Use `anonymousId` for logged-out users
4. **Event Naming**: Use consistent, descriptive event names
5. **Properties**: Include relevant context in event properties
6. **Flushing**: Call `flush()` before process termination
7. **Error Handling**: Wrap calls in try-catch for critical paths

## Common Events

Here are some common event patterns:

```typescript
// E-commerce Events
await analytics.track('Product Viewed', {
  productId: 'prod-123',
  name: 'T-Shirt',
  price: 29.99,
  currency: 'USD',
  category: 'Clothing',
});

await analytics.track('Order Completed', {
  orderId: 'order-456',
  revenue: 99.99,
  currency: 'USD',
  products: [{
    productId: 'prod-123',
    quantity: 2,
    price: 29.99,
  }],
});

// User Engagement
await analytics.track('Signed Up', {
  method: 'google',
  plan: 'free',
});

await analytics.track('Feature Used', {
  feature: 'Export PDF',
  duration: 3.5,
});

// Error Tracking
await analytics.track('Error Occurred', {
  error_code: 'AUTH_FAILED',
  error_message: 'Invalid credentials',
  context: 'login',
});
```

## Creating Custom Emitters

Extend the `BaseAnalyticsEmitter` class:

```typescript
import { BaseAnalyticsEmitter } from '@repo/analytics/emitters';

export class CustomEmitter extends BaseAnalyticsEmitter {
  async identify(message: IdentifyMessage): Promise<void> {
    // Your implementation
  }

  async track(message: TrackMessage): Promise<void> {
    // Your implementation
  }

  // Implement other required methods...
}
```

## Testing

Mock analytics in tests:

```typescript
const mockAnalytics = {
  identify: jest.fn(),
  track: jest.fn(),
  page: jest.fn(),
  group: jest.fn(),
  alias: jest.fn(),
  flush: jest.fn(),
  reset: jest.fn(),
};

// Use mockAnalytics in your tests
```

## TypeScript Support

The library is fully typed. Import types as needed:

```typescript
import type {
  AnalyticsEmitter,
  TrackMessage,
  IdentifyMessage,
  AnalyticsContext,
} from '@repo/analytics/emitters/types';
```