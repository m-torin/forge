# Web-Template Database Connection Audit

## Executive Summary

A comprehensive audit of the web-template application reveals that while product browsing and
discovery features are well-connected to the database, the entire purchasing flow (cart, checkout,
orders) and several other features are using mock data or placeholder implementations.

## Detailed Findings

### 1. Cart System ❌ Not Connected

**Files Affected:**

- `/app/[locale]/(main)/(other-pages)/cart/page.tsx`
- `/src/actions/cart.ts`
- `/src/components/CartContent.tsx`
- `/src/components/ContextualCartBtn.tsx`

**Current State:**

- Cart actions return empty arrays or success: true
- Imports reference non-existent `@/data/data-service`
- Cart count shows 0 or hardcoded values

**Database Status:**

- ✅ Cart schema exists (just created)
- ✅ Cart ORM layer exists
- ✅ Cart actions exist in @repo/database
- ❌ Not connected in web-template

**Required Actions:**

```typescript
// Update /src/actions/cart.ts to use:
import {
  getOrCreateCart,
  addToCart,
  updateCartItemQuantity,
} from '@repo/database/prisma/actions/cart';
```

### 2. Order Management ❌ Not Connected

**Files Affected:**

- `/app/[locale]/(main)/(accounts)/orders/page.tsx`
- `/app/[locale]/(main)/(accounts)/orders/[number]/page.tsx`
- `/app/[locale]/(main)/(other-pages)/order-successful/page.tsx`

**Current State:**

- Imports from non-existent `@/data/data-service`
- Order pages show error or empty state
- No order history functionality

**Database Status:**

- ✅ Order schema exists (just created)
- ✅ Order ORM layer exists
- ✅ Order actions exist in @repo/database
- ❌ Not connected in web-template

**Missing Type Definitions:**

```typescript
// Need to create types/order.ts with:
export interface TOrder {
  id: string;
  orderNumber: string;
  status: string;
  // ... etc
}
```

### 3. Checkout Process ❌ Not Connected

**Files Affected:**

- `/app/[locale]/(main)/(other-pages)/checkout/page.tsx`
- `/app/[locale]/(main)/(other-pages)/checkout/PaymentMethod.tsx`
- `/app/[locale]/(main)/(other-pages)/checkout/ShippingAddress.tsx`
- `/app/[locale]/(main)/(other-pages)/checkout/ContactInfo.tsx`

**Current State:**

- Full UI exists but no backend processing
- No Stripe integration despite @repo/payments existing
- No address saving functionality

**Database Status:**

- ✅ Address schema exists (just created)
- ✅ Transaction schema exists
- ❌ No checkout server action
- ❌ No payment processing connection

### 4. User Profile ⚠️ Partially Connected

**Files Affected:**

- `/app/[locale]/(main)/(accounts)/account/page.tsx`
- `/app/[locale]/(main)/(accounts)/account/account-form.tsx`
- `/src/actions/user.ts`

**Current State:**

- Auth fields (name, email) update correctly
- Additional fields (phone, birth date, bio) have TODO comments
- No address management despite UI existing

**Database Status:**

- ✅ User table has fields
- ⚠️ Some fields not being saved
- ❌ Address management not connected

### 5. Events System ❌ Not Connected

**Files Affected:**

- `/app/[locale]/(main)/(other-pages)/events/page.tsx`
- `/app/[locale]/(main)/(other-pages)/events/[slug]/page.tsx`

**Current State:**

```typescript
const mockEvents = [
  { id: '1', title: 'Summer Sale Event', date: '2024-07-15', ... },
  { id: '2', title: 'New Collection Launch', date: '2024-08-01', ... }
];
```

**Database Status:**

- ❌ No Event model in schema
- ❌ No event actions
- ❌ Would need new schema design

### 6. Locations System ❌ Not Connected

**Files Affected:**

- `/app/[locale]/(main)/(other-pages)/locations/page.tsx`
- `/app/[locale]/(main)/(other-pages)/locations/[slug]/page.tsx`

**Current State:**

```typescript
const locations = [
  { id: 1, name: "Downtown Store", address: "123 Main St", ... },
  { id: 2, name: "Mall Location", address: "456 Shopping Center", ... }
];
```

**Database Status:**

- ❌ No Location model in schema
- ❌ No location actions
- ❌ Would need new schema design

### 7. Account Billing ❌ Not Connected

**Files Affected:**

- `/app/[locale]/(main)/(accounts)/account-billing/page.tsx`
- `/app/[locale]/(main)/(accounts)/account-billing/billing-content.tsx`

**Current State:**

- UI for payment methods exists
- TODO: "Integrate with Stripe"
- No stored payment methods

**Database Status:**

- ⚠️ @repo/payments package exists
- ❌ No integration in web-template
- ❌ No payment method storage

### 8. Static Content Components ❌ Not Connected

**Components with Hardcoded Data:**

1. **SectionStatistic** (`/about/SectionStatistic.tsx`)

   ```typescript
   const FOUNDER_DEMO = [
     { label: 'Worldwide Users', value: '1,321' },
     { label: 'Articles Published', value: '2,139' },
     { label: 'Countries Supported', value: '48' },
   ];
   ```

2. **SectionClientSay** (`/components/ui/SectionClientSay.tsx`)

   - Static testimonials array
   - Could use Review model

3. **SectionHowItWork** (`/components/sections/SectionHowItWork.tsx`)

   - Static process steps
   - Could be CMS content

4. **Contact Form** (`/contact/page.tsx`)
   - Form exists but doesn't save submissions
   - No contact_submissions table

### 9. Missing Data Service

**Referenced but Missing:**

- `/src/data/data-service.ts`
- `/src/data/hardcoded-data.ts`

**These files should contain:**

- Type definitions for orders, cart items
- Data fetching functions
- Type transformations

### 10. Working Database Connections ✅

**Successfully Connected Features:**

- Products & Variants
- Collections
- Categories
- Brands
- Articles/Blog
- Reviews
- Favorites/Wishlists
- Registries
- User Authentication
- Search (via Algolia)

## Priority Matrix

### 🔴 Critical (Blocks Purchase Flow)

1. **Cart Integration**

   - Connect cart actions to database
   - Implement session-based guest carts
   - Fix cart count display

2. **Order Processing**

   - Connect order creation
   - Implement order history
   - Fix order detail pages

3. **Checkout Flow**
   - Connect address forms
   - Integrate Stripe payments
   - Create order from cart

### 🟡 Important (Key Features)

1. **User Profile Completion**

   - Save all profile fields
   - Connect address management
   - Link to orders

2. **Payment Methods**

   - Stripe customer creation
   - Saved payment methods
   - Billing history

3. **Events & Locations**
   - Create database schemas
   - Build management UI
   - Connect to frontend

### 🟢 Nice to Have

1. **Dynamic Content**

   - Testimonials management
   - Statistics from real data
   - CMS for static content

2. **Contact Form**
   - Save submissions
   - Email notifications
   - Admin interface

## Implementation Checklist

- [ ] Create missing type definitions file
- [ ] Update cart actions to use database
- [ ] Create checkout server action
- [ ] Integrate Stripe payment processing
- [ ] Connect order management pages
- [ ] Complete user profile saving
- [ ] Design Events schema
- [ ] Design Locations schema
- [ ] Create contact submissions table
- [ ] Build admin interfaces for content

## File Structure Issues

**Missing Files:**

- `/src/data/data-service.ts`
- `/src/data/hardcoded-data.ts`
- `/src/types/order.ts`
- `/src/types/cart.ts`

**Incorrect Imports:** Multiple files import from non-existent data-service, causing runtime errors
on certain pages.

## Conclusion

The web-template has a complete UI implementation but lacks backend connections for the entire
purchase flow. Product browsing works well, but users cannot actually buy anything. The recent
schema additions for cart and orders provide the foundation, but the frontend integration work
remains to be done.
