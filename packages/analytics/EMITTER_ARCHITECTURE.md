# Emitter Architecture

This document outlines how emitters are the primary interface for the analytics system.

## Overview

Emitters are the **preferred and recommended way** to track analytics events. They provide:

1. **Type Safety** - Full TypeScript support with autocomplete
2. **Consistency** - All events follow Segment.io specification
3. **Validation** - Required properties validated at compile time
4. **Testing** - Pure data structures easy to test
5. **Provider Agnostic** - Works with any analytics provider

## Event Flow

```
Emitter Functions → Emitter Payloads → AnalyticsManager → Providers → External Services
```

### 1. Emitter Functions

Located in `/src/shared/emitters/`, these create standardized event payloads:

```typescript
import { track, identify, page } from '@repo/analytics/emitters';

const trackPayload = track('User Signed Up', { plan: 'premium' });
// Returns: { type: 'track', event: 'User Signed Up', properties: { plan: 'premium' } }
```

### 2. Analytics Manager Processing

The `AnalyticsManager` has multiple ways to handle emitter payloads:

```typescript
// Primary method: emit()
await analytics.emit(trackPayload);

// Overloaded methods
await analytics.track(trackPayload);

// Batch processing
await analytics.emitBatch([trackPayload, identifyPayload]);
```

### 3. Provider Distribution

The manager extracts the event data and distributes to all configured providers:

```typescript
// For a track payload, the manager calls:
provider.track(payload.event, payload.properties, context);
```

## Emitter Types

### Core Emitters

- `track()` - Custom events
- `identify()` - User identification
- `page()` - Page views
- `group()` - Group/organization tracking
- `alias()` - User identity merging

### Specialized Emitters

- `ecommerce.*` - E-commerce events (productViewed, orderCompleted, etc.)
- Context builders and helpers

## Usage Patterns

### Pattern 1: Direct Emission (Recommended)

```typescript
import { track } from '@repo/analytics/emitters';
await analytics.emit(track('Event', { data: 'value' }));
```

### Pattern 2: Overloaded Methods

```typescript
import { track } from '@repo/analytics/emitters';
await analytics.track(track('Event', { data: 'value' }));
```

### Pattern 3: Event Factories

```typescript
const events = {
  userSignedUp: (plan: string) => track('User Signed Up', { plan }),
};
await analytics.emit(events.userSignedUp('premium'));
```

### Pattern 4: Context Building

```typescript
const context = new ContextBuilder().setUser('123').build();
const pb = new PayloadBuilder(context);
await analytics.emit(pb.track('Event', { data: 'value' }));
```

## Benefits Over Direct Tracking

### ❌ Direct Tracking (Not Recommended)

```typescript
analytics.track('User Signed Up', { plan: 'premium' });
```

- No type safety
- Inconsistent event structure
- Manual validation required
- Hard to test
- Provider-specific quirks

### ✅ Emitter-Based Tracking (Recommended)

```typescript
analytics.emit(track('User Signed Up', { plan: 'premium' }));
```

- Full TypeScript support
- Consistent Segment.io specification
- Automatic validation
- Easy to test and mock
- Provider agnostic

## Migration Strategy

1. **New events**: Always use emitters
2. **Existing events**: Gradually migrate using overloaded methods
3. **Event factories**: Create reusable event functions
4. **Context**: Use builders for consistent context
5. **Testing**: Mock emitter payloads instead of analytics calls

## Testing with Emitters

```typescript
import { track } from '@repo/analytics/emitters';

// Test the emitter (pure function)
const payload = track('User Signed Up', { plan: 'premium' });
expect(payload).toEqual({
  type: 'track',
  event: 'User Signed Up',
  properties: { plan: 'premium' },
});

// Test analytics integration
const mockAnalytics = {
  emit: jest.fn(),
};
await mockAnalytics.emit(payload);
expect(mockAnalytics.emit).toHaveBeenCalledWith(payload);
```

## Provider Compatibility

All providers automatically work with emitter payloads because the `AnalyticsManager` handles the
conversion:

- **Segment**: `analytics.track(event, properties)`
- **PostHog**: `posthog.capture(event, properties)`
- **Vercel**: `track(event, properties)`
- **Console**: `console.log(event, properties)`

The emitter architecture ensures consistent data flow regardless of which providers are configured.
