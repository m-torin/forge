# Prisma Schema Changes Plan

## Overview

This document outlines the required Prisma schema changes to complete the e-commerce functionality
for the web-template application. The changes focus on adding missing transactional models while
maintaining consistency with existing patterns.

## Existing Schema Analysis

### Current Models

- ✅ **Product Management**: Product, ProductVariant, ProductCategory, Brand, Collection
- ✅ **User Management**: User, Organization, Member
- ✅ **Reviews & Registry**: Review, Registry, RegistryItem
- ✅ **Media**: Media assets with variant support
- ❌ **Cart**: Missing
- ❌ **Orders**: Missing
- ❌ **Payments**: Missing
- ❌ **Shipping**: Missing
- ❌ **Inventory**: Missing

### Existing Patterns to Follow

1. All models include: `id`, `createdAt`, `updatedAt`, `deletedAt`
2. Soft delete pattern with `deletedAt` field
3. JSON fields for flexible metadata
4. Hierarchical relationships using `parentId`
5. Junction tables for many-to-many relationships
6. Enum definitions in separate file

## Proposed Schema Changes

### 1. Address Model

```prisma
model Address {
  id         String    @id @default(cuid())
  userId     String?
  user       User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type       AddressType @default(SHIPPING)
  isDefault  Boolean     @default(false)

  firstName  String
  lastName   String
  company    String?
  phone      String?

  street1    String
  street2    String?
  city       String
  state      String
  postalCode String
  country    String      @default("US")

  // Validation flags
  isValidated Boolean    @default(false)
  validatedAt DateTime?

  // Relations
  orderShippingAddresses Order[] @relation("ShippingAddress")
  orderBillingAddresses  Order[] @relation("BillingAddress")

  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  deletedAt  DateTime?

  @@index([userId])
  @@index([type])
}

enum AddressType {
  SHIPPING
  BILLING
  BOTH
}
```

### 2. Cart Model

```prisma
model Cart {
  id              String    @id @default(cuid())
  userId          String?
  user            User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionId       String?   // For guest carts

  status          CartStatus @default(ACTIVE)
  expiresAt       DateTime?  // For abandoned cart cleanup

  // Cart metadata
  currency        String     @default("USD")
  notes           String?
  metadata        Json?

  // Relations
  items           CartItem[]

  // Analytics
  abandonedAt     DateTime?
  recoveredAt     DateTime?

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  deletedAt       DateTime?

  @@unique([userId])
  @@index([sessionId])
  @@index([status])
  @@index([expiresAt])
}

model CartItem {
  id              String    @id @default(cuid())
  cartId          String
  cart            Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)

  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  variantId       String?
  variant         ProductVariant? @relation(fields: [variantId], references: [id])

  quantity        Int
  price           Decimal   @db.Decimal(10, 2)

  // Gift/Registry info
  isGift          Boolean   @default(false)
  giftMessage     String?
  registryId      String?
  registry        Registry? @relation(fields: [registryId], references: [id])

  // Saved for later
  savedForLater   Boolean   @default(false)

  metadata        Json?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([cartId, productId, variantId])
  @@index([productId])
  @@index([variantId])
}

enum CartStatus {
  ACTIVE
  ABANDONED
  CONVERTED
  MERGED
}
```

### 3. Order Model

```prisma
model Order {
  id                  String    @id @default(cuid())
  orderNumber         String    @unique
  userId              String?
  user                User?     @relation(fields: [userId], references: [id])

  // Guest order info
  guestEmail          String?
  guestName           String?

  status              OrderStatus @default(PENDING)

  // Addresses
  shippingAddressId   String?
  shippingAddress     Address?  @relation("ShippingAddress", fields: [shippingAddressId], references: [id])
  billingAddressId    String?
  billingAddress      Address?  @relation("BillingAddress", fields: [billingAddressId], references: [id])

  // Pricing
  currency            String    @default("USD")
  subtotal            Decimal   @db.Decimal(10, 2)
  taxAmount           Decimal   @db.Decimal(10, 2)
  shippingAmount      Decimal   @db.Decimal(10, 2)
  discountAmount      Decimal   @db.Decimal(10, 2) @default(0)
  total               Decimal   @db.Decimal(10, 2)

  // Shipping
  shippingMethod      String?
  trackingNumber      String?
  shippedAt           DateTime?
  deliveredAt         DateTime?

  // Payment
  paymentStatus       PaymentStatus @default(PENDING)
  paymentMethod       String?

  // Relations
  items               OrderItem[]
  transactions        Transaction[]

  // Customer info
  customerNotes       String?
  internalNotes       String?

  metadata            Json?

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  @@index([userId])
  @@index([orderNumber])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
}

model OrderItem {
  id              String    @id @default(cuid())
  orderId         String
  order           Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  variantId       String?
  variant         ProductVariant? @relation(fields: [variantId], references: [id])

  // Snapshot data at time of order
  productName     String
  variantName     String?
  sku             String?

  quantity        Int
  price           Decimal   @db.Decimal(10, 2)
  total           Decimal   @db.Decimal(10, 2)

  // Gift/Registry info
  isGift          Boolean   @default(false)
  giftMessage     String?
  registryId      String?
  registry        Registry? @relation(fields: [registryId], references: [id])

  // Fulfillment
  status          OrderItemStatus @default(PENDING)
  fulfilledAt     DateTime?

  metadata        Json?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([productId])
  @@index([variantId])
  @@index([status])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
  FAILED
}

enum OrderItemStatus {
  PENDING
  PROCESSING
  FULFILLED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  PARTIALLY_PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
  CANCELLED
}
```

### 4. Transaction Model (Payments)

```prisma
model Transaction {
  id              String    @id @default(cuid())
  orderId         String
  order           Order     @relation(fields: [orderId], references: [id])

  type            TransactionType
  status          TransactionStatus @default(PENDING)

  amount          Decimal   @db.Decimal(10, 2)
  currency        String    @default("USD")

  // Payment gateway info
  gateway         String    // stripe, paypal, etc
  gatewayId       String?   // External transaction ID
  gatewayResponse Json?

  // Card info (last 4 digits only)
  paymentMethod   String?
  last4           String?

  // For refunds
  parentTransactionId String?
  parentTransaction   Transaction? @relation("RefundTransaction", fields: [parentTransactionId], references: [id])
  refunds             Transaction[] @relation("RefundTransaction")

  metadata        Json?

  processedAt     DateTime?
  failedAt        DateTime?
  failureReason   String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([orderId])
  @@index([gateway])
  @@index([gatewayId])
  @@index([status])
}

enum TransactionType {
  PAYMENT
  REFUND
  PARTIAL_REFUND
  VOID
}

enum TransactionStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  CANCELLED
}
```

### 5. Inventory Model

```prisma
model Inventory {
  id              String    @id @default(cuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  variantId       String?
  variant         ProductVariant? @relation(fields: [variantId], references: [id])

  // Stock levels
  quantity        Int       @default(0)
  reserved        Int       @default(0)  // Reserved for pending orders
  available       Int       @default(0)  // quantity - reserved

  // Thresholds
  lowStockThreshold Int?

  // Location (for multi-warehouse)
  locationId      String?
  locationName    String?

  // Tracking
  lastRestockedAt DateTime?

  metadata        Json?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([productId, variantId, locationId])
  @@index([available])
  @@index([locationId])
}

model InventoryTransaction {
  id              String    @id @default(cuid())
  inventoryId     String
  inventory       Inventory @relation(fields: [inventoryId], references: [id])

  type            InventoryTransactionType
  quantity        Int       // Positive for additions, negative for removals

  // Reference to order/return/adjustment
  referenceType   String?
  referenceId     String?

  notes           String?

  createdAt       DateTime  @default(now())
  createdBy       String?

  @@index([inventoryId])
  @@index([referenceType, referenceId])
}

enum InventoryTransactionType {
  RESTOCK
  SALE
  RETURN
  ADJUSTMENT
  RESERVATION
  RELEASE
}
```

### 6. Subscription Model (Future)

```prisma
model Subscription {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])

  status          SubscriptionStatus @default(ACTIVE)

  // Product/Plan info
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  planId          String?

  // Billing
  interval        SubscriptionInterval
  price           Decimal   @db.Decimal(10, 2)
  currency        String    @default("USD")

  // Stripe subscription ID
  stripeSubscriptionId String? @unique

  // Dates
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelledAt        DateTime?
  pausedAt           DateTime?
  resumeAt           DateTime?

  metadata        Json?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  @@index([userId])
  @@index([status])
  @@index([stripeSubscriptionId])
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
  EXPIRED
  PAST_DUE
}

enum SubscriptionInterval {
  MONTHLY
  QUARTERLY
  YEARLY
}
```

## Implementation Steps

### Phase 1: Foundation (Required for Cart/Orders)

1. **Address Schema**

   - Add to `ecommerce.prisma`
   - Create address management actions
   - Add validation with address service

2. **Cart Schema**

   - Add to `ecommerce.prisma`
   - Create cart actions (add, remove, update, merge)
   - Implement guest cart support with session management
   - Add abandoned cart cleanup job

3. **Inventory Schema**
   - Add to `ecommerce.prisma`
   - Create inventory tracking actions
   - Add stock validation to cart operations

### Phase 2: Order Management

1. **Order & OrderItem Schema**

   - Add to `ecommerce.prisma`
   - Create order creation from cart
   - Implement order status management
   - Add order history views

2. **Transaction Schema**
   - Add to `ecommerce.prisma`
   - Integrate with Stripe payment processing
   - Add refund management
   - Create payment reconciliation

### Phase 3: Advanced Features

1. **Subscription Schema** (if needed)

   - Add to new `subscription.prisma`
   - Integrate with Stripe subscriptions
   - Add recurring order generation

2. **Enhanced Analytics**
   - Add tracking for cart abandonment
   - Order conversion metrics
   - Customer lifetime value

## Migration Strategy

1. **Create new schema files**:

   - Keep existing schemas unchanged
   - Add new models to appropriate files
   - Update schema.prisma to include new files

2. **Generate and test migrations**:

   ```bash
   pnpm migrate:dev
   pnpm --filter @repo/database generate
   ```

3. **Create action layers**:

   - ORM layer for direct database access
   - Action layer for business logic
   - Type transformations for UI compatibility

4. **Update existing code**:
   - Connect cart/order pages to new actions
   - Update analytics tracking
   - Add proper error handling

## Data Relationships

### User Journey Flow

```
User/Guest → Cart → Order → Transaction
     ↓         ↓       ↓          ↓
  Address   CartItem OrderItem  Payment
     ↓         ↓       ↓
  Registry  Product  Inventory
```

### Key Relationships

- **User** has many Addresses, one Cart, many Orders
- **Cart** has many CartItems, converts to one Order
- **Order** has many OrderItems, many Transactions
- **Product/Variant** tracked in Inventory
- **Registry** items can be added to Cart/Order

## Performance Considerations

1. **Indexes**:

   - User lookups: userId on all user-related tables
   - Order search: orderNumber, status, createdAt
   - Cart operations: sessionId for guests
   - Inventory checks: productId + variantId

2. **Soft Deletes**:

   - All models include deletedAt
   - Critical for order/transaction history

3. **JSON Fields**:
   - metadata on all models for flexibility
   - Store gateway responses, custom attributes

## Security Considerations

1. **PII Protection**:

   - Addresses linked to users
   - Guest orders store minimal info
   - Payment details never stored (only last4)

2. **Access Control**:

   - Users can only access their own data
   - Admin roles for order management
   - API keys for external integrations

3. **Audit Trail**:
   - All models have createdAt/updatedAt
   - Transaction history immutable
   - Order status changes tracked

## Next Steps

1. Review and approve schema design
2. Create migration files
3. Generate Prisma client
4. Implement ORM layer
5. Create action files
6. Connect UI components
7. Add comprehensive tests
8. Deploy with proper monitoring
