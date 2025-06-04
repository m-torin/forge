# Platform-Standard Ecommerce Events

This module provides a standardized implementation of ecommerce tracking events that follows industry best practices. It's designed to be analytics-provider agnostic while maintaining compatibility with common specifications like Segment's.

## Architecture

The ecommerce module is structured to:

1. **Normalize Properties**: Handles common variations in property names (e.g., `productId` vs `product_id`)
2. **Validate Required Fields**: Ensures critical data is present before sending events
3. **Provider Agnostic**: Works with any analytics backend through the emitter pattern
4. **Type Safe**: Full TypeScript support with proper interfaces

## Usage

### Basic Event Tracking

```typescript
import { productViewed, trackEcommerce } from '@repo/analytics/internal/ecommerce';

// Track a product view
const event = productViewed({
  product_id: '12345',
  name: 'Awesome T-Shirt',
  price: 29.99,
  category: 'Apparel',
  brand: 'ACME'
});

trackEcommerce(event);
```

### Using Event Factories

For cleaner code, use the event factory pattern:

```typescript
import { createEcommerceTracker, productAdded } from '@repo/analytics/internal/ecommerce';

// Create a reusable tracker
const trackProductAdded = createEcommerceTracker(productAdded);

// Use it throughout your app
trackProductAdded({
  product_id: '12345',
  name: 'Awesome T-Shirt',
  price: 29.99,
  quantity: 2,
  cart_id: 'cart_abc123'
});
```

### Complete Checkout Flow Example

```typescript
import * as ecommerce from '@repo/analytics/internal/ecommerce';

// 1. User searches for products
trackEcommerce(ecommerce.productSearched({
  query: 't-shirt'
}));

// 2. Search results displayed
trackEcommerce(ecommerce.searchResultsViewed({
  query: 't-shirt',
  results_count: 42,
  products: [
    { product_id: '1', name: 'Classic T-Shirt', price: 29.99 },
    { product_id: '2', name: 'Premium T-Shirt', price: 39.99 }
  ]
}));

// 3. User clicks on a product
trackEcommerce(ecommerce.productClicked({
  product_id: '1',
  name: 'Classic T-Shirt',
  position: 1
}));

// 4. User views product detail
trackEcommerce(ecommerce.productViewed({
  product_id: '1',
  name: 'Classic T-Shirt',
  price: 29.99,
  category: 'Apparel',
  brand: 'ACME'
}));

// 5. User updates cart
trackEcommerce(ecommerce.cartUpdated({
  action: 'added',
  product: {
    product_id: '1',
    name: 'Classic T-Shirt',
    price: 29.99
  },
  quantity_change: 2,
  cart_total: 59.98
}));

// 6. User progresses through checkout
trackEcommerce(ecommerce.checkoutProgressed({
  step: 1,
  step_name: 'shipping_address',
  action: 'completed',
  products: [
    { product_id: '1', name: 'Classic T-Shirt', price: 29.99, quantity: 2 }
  ]
}));

trackEcommerce(ecommerce.checkoutProgressed({
  step: 2,
  step_name: 'payment_method',
  action: 'completed',
  payment_method: 'credit_card'
}));

// 7. User completes order
trackEcommerce(ecommerce.orderCompleted({
  order_id: 'ORD-12345',
  total: 65.48,
  revenue: 59.98,
  tax: 5.50,
  currency: 'USD',
  products: [
    { product_id: '1', name: 'Classic T-Shirt', price: 29.99, quantity: 2 }
  ]
}));

// 8. Order status updates (post-purchase)
trackEcommerce(ecommerce.orderStatusUpdated({
  order_id: 'ORD-12345',
  status: 'shipped',
  tracking_number: '1Z999AA10123456784',
  carrier: 'UPS'
}));
```

### Marketplace Flow Example

```typescript
import * as ecommerce from '@repo/analytics/internal/ecommerce';

// 1. User views product with multiple merchant options
trackEcommerce(ecommerce.productViewed({
  product_id: '12345',
  name: 'iPhone 15 Pro',
  brand: 'Apple',
  category: 'Electronics',
  // Product can have merchant info even in standard events
  merchant_id: 'merchant_123',
  merchant_name: 'TechStore',
  price: 999.99,
  original_price: 1099.99,
  availability: 'in_stock'
}));

// 2. User compares prices across merchants
trackEcommerce(ecommerce.priceComparisonViewed({
  product_id: '12345',
  merchants: [
    { merchant_id: 'merchant_123', merchant_name: 'TechStore', price: 999.99, rating: 4.5 },
    { merchant_id: 'merchant_456', merchant_name: 'MegaShop', price: 1049.99, rating: 4.8 },
    { merchant_id: 'merchant_789', merchant_name: 'QuickBuy', price: 989.99, shipping: 15.00 }
  ],
  lowest_price: 989.99,
  highest_price: 1049.99
}));

// 3. User selects a merchant
trackEcommerce(ecommerce.merchantSelected({
  product_id: '12345',
  name: 'iPhone 15 Pro',
  selected_merchant_id: 'merchant_456',
  selected_merchant_name: 'MegaShop',
  selection_reason: 'best_rating',
  compared_merchants: ['merchant_123', 'merchant_789']
}));

// 4. User clicks affiliate link
trackEcommerce(ecommerce.affiliateLinkClicked({
  product_id: '12345',
  name: 'iPhone 15 Pro',
  merchant_id: 'merchant_456',
  destination_url: 'https://megashop.com/products/iphone-15-pro?ref=yoursite',
  affiliate_network: 'ShareASale',
  commission_rate: 0.03
}));

// 5. Later: Conversion webhook confirms purchase
trackEcommerce(ecommerce.affiliateConversionTracked({
  product_id: '12345',
  order_id: 'MEGA-ORDER-98765',
  merchant_id: 'merchant_456',
  merchant_name: 'MegaShop',
  affiliate_network: 'ShareASale',
  commission_amount: 29.99,
  conversion_value: 999.99,
  currency: 'USD'
}));
```

### Registry Flow Example

```typescript
import * as ecommerce from '@repo/analytics/internal/ecommerce';

// 1. User creates a wedding registry
trackEcommerce(ecommerce.registryCreated({
  registry_id: 'REG-001',
  registry_type: 'wedding',
  registry_name: 'John & Jane Wedding Registry',
  event_date: '2024-06-15',
  privacy_setting: 'public'
}));

// 2. User adds items to registry
trackEcommerce(ecommerce.registryItemAdded({
  registry_id: 'REG-001',
  product_id: 'KITCHEN-001',
  name: 'KitchenAid Stand Mixer',
  price: 379.99,
  requested_quantity: 1,
  priority: 'high',
  merchant_id: 'williams_sonoma',
  merchant_name: 'Williams Sonoma'
}));

// 3. Friend views the registry
trackEcommerce(ecommerce.registryViewed({
  registry_id: 'REG-001',
  registry_type: 'wedding',
  viewer_id: 'user_456',
  viewer_relationship: 'friend',
  items_count: 25,
  items_fulfilled: 5
}));

// 4. Friend purchases an item
trackEcommerce(ecommerce.registryItemPurchased({
  registry_id: 'REG-001',
  product_id: 'KITCHEN-001',
  name: 'KitchenAid Stand Mixer',
  price: 379.99,
  purchase_quantity: 1,
  purchaser_id: 'user_456',
  purchaser_name: 'Sarah Smith',
  purchase_message: 'Congratulations! Can't wait for the big day!',
  gift_wrap: true
}));

// 5. Registry owner shares with more friends
trackEcommerce(ecommerce.registryShared({
  registry_id: 'REG-001',
  registry_type: 'wedding',
  share_method: 'email',
  recipients_count: 50,
  message: 'We would love for you to celebrate with us!'
}));
```

## Available Events

### Search & Discovery Events
- `productSearched` - User searches for products
- `searchResultsViewed` - Search results displayed
- `productListViewed` - User views a list/category of products
- `productListFiltered` - User applies filters to a product list
- `productClicked` - User clicks on a product
- `productViewed` - User views product details
- `productCompared` - Product comparison actions
- `productRecommendationViewed` - Recommendations displayed
- `productRecommendationClicked` - Recommendation clicked

### Cart Events
- `cartUpdated` - Single event for add/remove/update with action type
- `cartViewed` - User views their cart
- `cartAbandoned` - Cart inactive for X minutes

### Checkout Events
- `checkoutProgressed` - Single event with step, action (viewed/completed/abandoned/error)

### Order Events
- `orderCompleted` - Order successfully completed
- `orderFailed` - Payment or validation failure
- `orderRefunded` - Order refunded
- `orderCancelled` - Order cancelled
- `orderStatusUpdated` - Shipping/delivery updates

### Post-Purchase Events
- `returnRequested` - Return initiated
- `returnCompleted` - Return processed

### Coupon Events
- `couponApplied` - Coupon successfully applied
- `couponRemoved` - Coupon removed

### Wishlist Events
- `productAddedToWishlist` - Product added to wishlist
- `productRemovedFromWishlist` - Product removed from wishlist
- `wishlistProductAddedToCart` - Wishlist item moved to cart

### Engagement Events
- `priceAlertSet` - Price drop notification requested
- `backInStockRequested` - Stock notification requested

### Sharing & Review Events
- `productShared` - User shares a product
- `cartShared` - User shares their cart
- `productReviewed` - User reviews a product

### Marketplace Events
- `priceComparisonViewed` - User views price comparisons across merchants
- `merchantSelected` - User selects a specific merchant
- `affiliateLinkClicked` - User clicks through to merchant site
- `affiliateConversionTracked` - Conversion confirmed via affiliate network

### Registry Events
- `registryManaged` - Create/update/delete with action type
- `registryViewed` - Registry is viewed
- `registryShared` - Registry shared with others
- `registryItemManaged` - Add/remove/update/purchase with action type

## Property Normalization

The module automatically normalizes common property variations:

```typescript
// All of these will be normalized to product_id
{ product_id: '123' }
{ productId: '123' }
{ id: '123' }

// Price strings are converted to numbers
{ price: '29.99' } → { price: 29.99 }

// Common name variations
{ title: 'T-Shirt' } → { name: 'T-Shirt' }
{ productName: 'T-Shirt' } → { name: 'T-Shirt' }
```

## Integration with Analytics Providers

When implementing specific analytics providers (Google Analytics, Segment, etc.), create an adapter that transforms these standardized events:

```typescript
class SegmentAdapter {
  mapEvent(standardEvent: EcommerceEventSpec) {
    // Transform to Segment's expected format
    return {
      event: standardEvent.name,
      properties: this.transformProperties(standardEvent.properties)
    };
  }
}

class GoogleAnalyticsAdapter {
  mapEvent(standardEvent: EcommerceEventSpec) {
    // Transform to GA's expected format
    if (standardEvent.name === 'Product Viewed') {
      return {
        event: 'view_item',
        ecommerce: {
          items: [this.transformProduct(standardEvent.properties)]
        }
      };
    }
    // ... handle other events
  }
}
```

This approach ensures your application code remains consistent regardless of which analytics providers you use.