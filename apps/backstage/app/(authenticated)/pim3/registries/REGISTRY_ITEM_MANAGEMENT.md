# Registry Item Management System

This document describes the comprehensive RegistryItem management interface that has been
implemented for the backstage application.

## Overview

The Registry Item Management System provides a complete solution for managing individual items
within customer registries. It supports linking both products and collections to registries with
full CRUD operations, priority management, quantity tracking, purchase recording, and wishlist
functionality.

## Key Features

### 1. Registry Item CRUD Operations

- **Create**: Add products or collections to registries
- **Read**: View item details with full relationships
- **Update**: Modify quantity, priority, notes, and other item properties
- **Delete**: Remove items from registries (soft delete)

### 2. Item Types Support

- **Products**: Individual products with SKU, price, and descriptions
- **Collections**: Groups of products with type categorization

### 3. Priority and Quantity Management

- **Priority System**: 0-10 scale with visual indicators
- **Quantity Tracking**: Support for multiple quantities per item
- **Bulk Priority Updates**: Edit multiple item priorities simultaneously

### 4. Purchase Tracking

- **Purchase Recording**: Track who purchased what and when
- **Status Management**: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, RETURNED
- **Shipping Information**: Tracking numbers, URLs, delivery dates
- **Gift Support**: Gift messages, gift wrapping, thank you tracking
- **Transaction Tracking**: Transaction IDs, order numbers, prices

### 5. Wishlist Functionality

- **Favorites**: Mark items as favorites with visual indicators
- **Notes**: Add personal notes and preferences to items
- **Sharing**: Share wishlists via email with custom messages
- **Priority Visualization**: Color-coded priority indicators

### 6. Analytics and Reporting

- **Item Analytics**: Track popular products, collections, priority distributions
- **Purchase Analytics**: Monitor purchase activity, conversion rates
- **Performance Metrics**: Success rates, completion percentages

## Components

### 1. RegistryItemModal

**File**: `components/RegistryItemModal.tsx`

A comprehensive modal for adding and editing registry items.

**Features**:

- Product/Collection type selection
- Search and select products or collections
- Quantity and priority setting with visual sliders
- Notes and preferences
- Real-time price calculation
- Form validation

**Props**:

```typescript
interface RegistryItemModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  registry: RegistryWithRelations;
  item?: ExistingItem; // For editing
}
```

### 2. PurchaseTrackingModal

**File**: `components/PurchaseTrackingModal.tsx`

Modal for recording and tracking purchases of registry items.

**Features**:

- Purchaser selection
- Quantity and price recording
- Status tracking with shipping information
- Gift support with messages
- Transaction details

**Props**:

```typescript
interface PurchaseTrackingModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  registryItem: RegistryItemDetails;
  purchase?: ExistingPurchase; // For updating
}
```

### 3. RegistryItemManagement

**File**: `components/RegistryItemManagement.tsx`

Main management interface for all registry items.

**Features**:

- Comprehensive item table with sorting and filtering
- Bulk operations (priority updates, selection)
- In-line priority editing mode
- Purchase status tracking
- Quick actions (mark purchased, edit, remove)
- Statistics dashboard

**Props**:

```typescript
interface RegistryItemManagementProps {
  registryId: string;
  editable?: boolean;
  showAddButton?: boolean;
}
```

### 4. WishlistFunctionality

**File**: `components/WishlistFunctionality.tsx`

Wishlist-specific features and enhancements.

**Features**:

- Favorite item bookmarking
- Personal notes and preferences
- Wishlist sharing via email
- Priority visualization
- Completion tracking

**Props**:

```typescript
interface WishlistFunctionalityProps {
  registry: RegistryWithRelations;
  onRefresh?: () => void;
}
```

### 5. RegistryItemAnalytics

**File**: `components/RegistryItemAnalytics.tsx`

Detailed analytics for registry items.

**Features**:

- Conversion rate tracking
- Priority distribution analysis
- Top products and collections
- Purchase activity trends
- Visual progress indicators

**Props**:

```typescript
interface RegistryItemAnalyticsProps {
  registryId?: string; // Global analytics if not provided
}
```

## Server Actions

### Core CRUD Operations

```typescript
// Add item to registry
addRegistryItem(data: RegistryItemFormData)

// Update existing item
updateRegistryItem(id: string, data: Partial<RegistryItemFormData>)

// Remove item (soft delete)
removeRegistryItem(id: string)

// Get item with full details
getRegistryItem(id: string)
```

### Bulk Operations

```typescript
// Add multiple items at once
bulkAddRegistryItems(registryId: string, items: ItemData[])

// Update multiple item priorities
bulkUpdateItemPriorities(updates: PriorityUpdate[])
```

### Purchase Management

```typescript
// Record a purchase
recordItemPurchase(data: PurchaseData)

// Update purchase status
updatePurchaseStatus(purchaseId: string, status: PurchaseStatus, trackingInfo?: TrackingInfo)

// Mark item as purchased/unpurchased
markItemPurchased(id: string, purchased: boolean)
```

### Data Retrieval

```typescript
// Get products for selection
getProductsForSelect(search?: string)

// Get collections for selection
getCollectionsForSelect(search?: string)

// Get registry item analytics
getRegistryItemAnalytics(registryId?: string)
```

## Database Schema Support

The system leverages the existing Prisma schema models:

### RegistryItem

- Links products/collections to registries
- Supports quantity, priority, notes
- Tracks purchase status
- Soft delete support

### RegistryPurchaseJoin

- Tracks individual purchases
- Purchase status and tracking
- Gift information
- Thank you message tracking

### Registry

- Supports different registry types (WISHLIST, GIFT, WEDDING, etc.)
- Public/private visibility
- User role management

## Usage Examples

### Adding Items to Registry

```typescript
// Open modal to add new item
setEditingItem(null);
setItemModalOpened(true);

// Handle form submission
const result = await addRegistryItem({
  registryId: 'registry-id',
  productId: 'product-id',
  quantity: 2,
  priority: 7,
  notes: 'Size medium preferred',
});
```

### Recording Purchases

```typescript
// Record a purchase
const result = await recordItemPurchase({
  registryItemId: 'item-id',
  purchaserId: 'user-id',
  quantity: 1,
  price: 29.99,
  isGift: true,
  giftMessage: 'Happy Birthday!',
});
```

### Bulk Priority Updates

```typescript
// Update multiple item priorities
const updates = [
  { id: 'item-1', priority: 8 },
  { id: 'item-2', priority: 5 },
];

await bulkUpdateItemPriorities(updates);
```

## Integration Points

### 1. Registry Management

The item management system integrates seamlessly with the existing registry management:

- Items are displayed in the RegistryDetailsModal
- Analytics are available in the main registries dashboard

### 2. Product/Collection Systems

- Leverages existing product and collection data
- Supports search and filtering
- Displays pricing and inventory information

### 3. User Management

- Integrates with user selection for purchase tracking
- Supports role-based permissions
- User avatar and profile integration

## Performance Considerations

### 1. Pagination and Search

- Product/collection selection is limited to 50 results
- Debounced search to reduce API calls
- Efficient database queries with proper indexing

### 2. Bulk Operations

- Batch updates for priority changes
- Optimistic UI updates where appropriate
- Loading states for all async operations

### 3. Analytics Caching

- Analytics data can be cached for performance
- Incremental updates for real-time metrics
- Efficient aggregation queries

## Security Features

### 1. Input Validation

- All forms use Zod validation schemas
- Server-side validation for all operations
- Type-safe API endpoints

### 2. Permission Checks

- Registry ownership validation
- User role verification
- Soft delete for data retention

### 3. Data Sanitization

- HTML/script injection prevention
- Input length limits
- Proper error handling

## Future Enhancements

### 1. Advanced Features

- Item comparison functionality
- Automated price tracking
- Inventory notifications
- Social sharing improvements

### 2. Mobile Support

- Responsive design optimization
- Touch-friendly interactions
- Mobile-specific UI patterns

### 3. Integration Expansions

- Third-party e-commerce platforms
- Social media sharing
- Email automation
- Push notifications

## Testing

### 1. Unit Tests

- Form validation testing
- Server action testing
- Component rendering tests

### 2. Integration Tests

- End-to-end user flows
- Database operation testing
- API endpoint validation

### 3. Performance Tests

- Load testing for bulk operations
- Database query optimization
- UI responsiveness testing

This comprehensive system provides a complete solution for registry item management with all
requested features implemented and ready for production use.
