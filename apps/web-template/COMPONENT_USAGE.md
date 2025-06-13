# Component Usage Guide

This guide shows how to use the newly migrated Breadcrumb and ReviewItem components.

## Import

```typescript
import { Breadcrumb, ReviewItem, Avatar } from '@/components/ui';
// or individually
import Breadcrumb from '@/components/ui/Breadcrumb';
import ReviewItem from '@/components/ui/ReviewItem';
import Avatar from '@/components/ui/Avatar';
```

## Breadcrumb Component

```tsx
import { Breadcrumb } from '@/components/ui';

const breadcrumbs = [
  { href: '/', id: 1, name: 'Home' },
  { href: '/products', id: 2, name: 'Products' },
  { href: '/products/electronics', id: 3, name: 'Electronics' },
];

function ProductPage() {
  return <Breadcrumb breadcrumbs={breadcrumbs} currentPage="Smartphone" className="mb-4" />;
}
```

## ReviewItem Component

```tsx
import { ReviewItem } from '@/components/ui';
import { TReview } from '@/types';

const review: TReview = {
  id: '1',
  rating: 4,
  comment: 'Great product! Highly recommended.',
  author: {
    name: 'John Doe',
    image: 'https://example.com/avatar.jpg',
  },
  createdAt: '2024-01-15',
};

function ProductReviews() {
  return (
    <div className="space-y-4">
      <ReviewItem data={review} className="border-b pb-4" />
    </div>
  );
}
```

## Avatar Component

```tsx
import { Avatar } from '@/components/ui';

function UserProfile() {
  return (
    <Avatar
      userName="Jane Smith"
      imgUrl="https://example.com/jane.jpg"
      sizeClass="size-12 text-lg"
      testId="user-avatar"
    />
  );
}
```

## Type Compatibility

The components are designed to work with both new and legacy TReview formats:

```typescript
// New format (preferred)
const newReview: TReview = {
  id: '1',
  rating: 5,
  comment: 'Excellent!',
  author: {
    name: 'Alice Johnson',
    image: 'https://example.com/alice.jpg',
  },
  createdAt: '2024-01-15',
};

// Legacy format (still supported)
const legacyReview: TReview = {
  id: '2',
  rating: 4,
  content: 'Good product',
  author: 'Bob Wilson', // string format
  authorAvatar: 'https://example.com/bob.jpg',
  date: '2024-01-10',
};
```

Both formats work seamlessly with the ReviewItem component.
