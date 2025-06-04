# Analytics Package Usage

This package provides comprehensive analytics tracking with ecommerce event support.

## Installation

```bash
npm install @repo/analytics
```

## Usage

### Client-Side (Browser/React)

```typescript
// Import main analytics functions
import { track, identify, page, ecommerce } from '@repo/analytics';

// Basic tracking
track('Button Clicked', { 
  button_name: 'signup',
  page: 'homepage' 
});

// User identification
identify('user_123', {
  email: 'user@example.com',
  name: 'John Doe'
});

// Page views
page('Homepage', { 
  url: '/home',
  referrer: 'google.com' 
});

// Ecommerce tracking
import { trackEcommerce } from '@repo/analytics';

trackEcommerce(ecommerce.productViewed({
  product_id: '12345',
  name: 'iPhone 15 Pro',
  price: 999.99,
  category: 'Electronics'
}));

trackEcommerce(ecommerce.cartUpdated({
  action: 'added',
  product: {
    product_id: '12345',
    name: 'iPhone 15 Pro',
    price: 999.99
  },
  quantity_change: 1,
  cart_total: 999.99
}));
```

### Server-Side (Node.js/Next.js)

```typescript
// Import server analytics
import { track, identify, ecommerce } from '@repo/analytics/server';

// Server-side tracking
track('API Request', {
  endpoint: '/api/users',
  method: 'POST',
  response_time: 150
});

// Server-side ecommerce
import { trackEcommerce } from '@repo/analytics/server';

trackEcommerce(ecommerce.orderCompleted({
  order_id: 'ORD-12345',
  total: 1049.99,
  currency: 'USD',
  products: [
    {
      product_id: '12345',
      name: 'iPhone 15 Pro',
      price: 999.99,
      quantity: 1
    }
  ]
}));
```

## Available Events

### Core Events
- `track(event, properties)` - Custom event tracking
- `identify(userId, traits)` - User identification
- `page(name, properties)` - Page view tracking
- `screen(name, properties)` - Screen view tracking (mobile)
- `group(groupId, traits)` - Group/organization tracking
- `alias(userId, previousId)` - Identity merging

### Ecommerce Events
- `productSearched` - Product search
- `searchResultsViewed` - Search results displayed
- `productViewed` - Product detail page views
- `cartUpdated` - Cart modifications (add/remove/update)
- `checkoutProgressed` - Checkout flow progression
- `orderCompleted` - Purchase completion
- `orderStatusUpdated` - Order fulfillment updates
- And many more...

## Configuration

```typescript
import { configureEmitter } from '@repo/analytics';

// Configure transport layer
configureEmitter(async (payload) => {
  // Send to your analytics service
  await fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
});
```

## TypeScript Support

Full TypeScript support with proper types for all events and properties:

```typescript
import type { 
  EmitterOptions, 
  BaseProductProperties,
  OrderProperties 
} from '@repo/analytics';

const product: BaseProductProperties = {
  product_id: '123',
  name: 'T-Shirt',
  price: 29.99
};
```