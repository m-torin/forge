// Common skeleton base classes for consistency
const SKELETON_BASE = "bg-neutral-200 dark:bg-neutral-700 animate-pulse";
const SKELETON_ROUNDED = "rounded";
const SKELETON_ROUNDED_LG = "rounded-lg";
const SKELETON_ROUNDED_XL = "rounded-xl";
const SKELETON_ROUNDED_2XL = "rounded-2xl";
const SKELETON_ROUNDED_3XL = "rounded-3xl";

// =============================================================================
// PRODUCT COMPONENTS
// =============================================================================

export function ProductCardSkeleton() {
  return (
    <div className="group relative">
      {/* Product Image */}
      <div className={`aspect-[11/12] w-full ${SKELETON_ROUNDED_3XL} ${SKELETON_BASE}`} />
      
      {/* Product Info */}
      <div className="mt-4 space-y-3">
        {/* Category/Brand */}
        <div className={`h-3 w-16 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        
        {/* Product Title */}
        <div className={`h-5 w-3/4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        
        {/* Price */}
        <div className={`h-6 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-4 w-4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          ))}
          <div className={`ml-2 h-3 w-8 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-3 right-3">
        <div className={`h-8 w-8 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

export function ProductCardLargeSkeleton() {
  return (
    <div className="group relative">
      {/* Large Product Image */}
      <div className={`aspect-[4/5] w-full ${SKELETON_ROUNDED_3XL} ${SKELETON_BASE}`} />
      
      {/* Product Info */}
      <div className="mt-6 space-y-4">
        {/* Category */}
        <div className={`h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        
        {/* Product Title */}
        <div className="space-y-2">
          <div className={`h-6 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-6 w-2/3 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className={`h-4 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-4 w-3/4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between">
          <div className={`h-7 w-24 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-4 w-4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
            ))}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <div className={`h-12 w-full ${SKELETON_ROUNDED_LG} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={`product-skeleton-${i}`} />
      ))}
    </div>
  );
}

export function ProductSliderSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-6 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="min-w-[280px] flex-shrink-0">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function ProductLargeSliderSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-8 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="min-w-[400px] flex-shrink-0">
          <ProductCardLargeSkeleton />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// COLLECTION COMPONENTS
// =============================================================================

export function CollectionCardSkeleton() {
  return (
    <div className="group relative">
      {/* Collection Image */}
      <div className={`aspect-square w-full ${SKELETON_ROUNDED_2XL} ${SKELETON_BASE}`} />
      
      {/* Collection Info */}
      <div className="mt-4 space-y-2">
        {/* Collection Title */}
        <div className={`h-6 w-3/4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        
        {/* Item Count */}
        <div className={`h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

export function CollectionSliderSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-6 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="min-w-[300px] flex-shrink-0">
          <CollectionCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function CollectionGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <CollectionCardSkeleton key={`collection-skeleton-${i}`} />
      ))}
    </div>
  );
}

// =============================================================================
// NAVIGATION COMPONENTS
// =============================================================================

export function HeaderSkeleton() {
  return (
    <div className="relative z-40">
      <div className="border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="container">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className={`h-8 w-32 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
            
            {/* Navigation Menu (Desktop) */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-4 w-16 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
              ))}
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className={`h-8 w-8 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
              
              {/* Cart */}
              <div className={`h-8 w-8 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
              
              {/* User Menu */}
              <div className={`h-8 w-8 rounded-full ${SKELETON_BASE}`} />
              
              {/* Mobile Menu Button */}
              <div className={`h-8 w-8 ${SKELETON_ROUNDED} ${SKELETON_BASE} lg:hidden`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2">
          <div className={`h-4 w-16 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          {i < 2 && <div className={`h-3 w-3 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// CONTENT COMPONENTS
// =============================================================================

export function HeroSkeleton() {
  return (
    <div className="relative">
      {/* Hero Background */}
      <div className={`h-[600px] w-full ${SKELETON_ROUNDED_3XL} ${SKELETON_BASE}`} />
      
      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Hero Title */}
          <div className="space-y-3">
            <div className={`h-12 w-80 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
            <div className={`h-12 w-64 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          </div>
          
          {/* Hero Subtitle */}
          <div className="space-y-2">
            <div className={`h-5 w-96 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
            <div className={`h-5 w-72 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          </div>
          
          {/* CTA Buttons */}
          <div className="flex justify-center space-x-4">
            <div className={`h-12 w-32 ${SKELETON_ROUNDED_LG} ${SKELETON_BASE}`} />
            <div className={`h-12 w-32 ${SKELETON_ROUNDED_LG} ${SKELETON_BASE}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <div className="group">
      {/* Featured Image */}
      <div className={`aspect-video w-full ${SKELETON_ROUNDED_2XL} ${SKELETON_BASE}`} />
      
      {/* Post Content */}
      <div className="mt-6 space-y-4">
        {/* Category */}
        <div className={`h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        
        {/* Title */}
        <div className="space-y-2">
          <div className={`h-6 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-6 w-3/4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
        
        {/* Excerpt */}
        <div className="space-y-2">
          <div className={`h-4 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-4 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-4 w-2/3 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
        
        {/* Meta Info */}
        <div className="flex items-center space-x-4">
          <div className={`h-8 w-8 rounded-full ${SKELETON_BASE}`} />
          <div className={`h-4 w-24 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
      </div>
    </div>
  );
}

export function BlogSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <BlogPostSkeleton key={`blog-skeleton-${i}`} />
      ))}
    </div>
  );
}

// =============================================================================
// FORM COMPONENTS
// =============================================================================

export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      {/* Label */}
      <div className={`h-4 w-24 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      
      {/* Input Field */}
      <div className={`h-12 w-full ${SKELETON_ROUNDED_LG} ${SKELETON_BASE}`} />
    </div>
  );
}

export function SearchFormSkeleton() {
  return (
    <div className="relative">
      <div className={`h-12 w-full ${SKELETON_ROUNDED_LG} ${SKELETON_BASE}`} />
      <div className={`absolute right-3 top-3 h-6 w-6 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
    </div>
  );
}

// =============================================================================
// E-COMMERCE COMPONENTS
// =============================================================================

export function CartItemSkeleton() {
  return (
    <div className="flex space-x-4 border-b border-neutral-200 pb-6 dark:border-neutral-700">
      {/* Product Image */}
      <div className={`h-20 w-20 flex-shrink-0 ${SKELETON_ROUNDED_LG} ${SKELETON_BASE}`} />
      
      {/* Product Info */}
      <div className="flex-1 space-y-2">
        <div className={`h-5 w-3/4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-4 w-1/2 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
      
      {/* Quantity and Price */}
      <div className="space-y-2 text-right">
        <div className={`h-8 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-4 w-16 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <CartItemSkeleton key={`cart-item-skeleton-${i}`} />
      ))}
      
      {/* Cart Summary */}
      <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
        <div className="flex justify-between">
          <div className={`h-4 w-16 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
        <div className="flex justify-between">
          <div className={`h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-4 w-16 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
        <div className="flex justify-between border-t pt-4">
          <div className={`h-5 w-12 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className={`h-5 w-24 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        </div>
        
        {/* Checkout Button */}
        <div className={`h-12 w-full ${SKELETON_ROUNDED_LG} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

export function PriceSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <div className={`h-6 w-16 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      <div className={`h-4 w-12 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
    </div>
  );
}

// =============================================================================
// REVIEW COMPONENTS
// =============================================================================

export function ReviewSkeleton() {
  return (
    <div className="space-y-4">
      {/* Review Header */}
      <div className="flex items-center space-x-4">
        <div className={`h-10 w-10 rounded-full ${SKELETON_BASE}`} />
        <div className="space-y-1">
          <div className={`h-4 w-24 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-4 w-4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
            ))}
          </div>
        </div>
        <div className={`ml-auto h-4 w-20 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
      
      {/* Review Content */}
      <div className="space-y-2">
        <div className={`h-4 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-4 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-4 w-3/4 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

export function ReviewsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {[...Array(count)].map((_, i) => (
        <ReviewSkeleton key={`review-skeleton-${i}`} />
      ))}
    </div>
  );
}

// =============================================================================
// PAGINATION COMPONENTS
// =============================================================================

export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <div className={`h-10 w-10 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      
      {/* Page Numbers */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`h-10 w-10 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      ))}
      
      {/* Next Button */}
      <div className={`h-10 w-10 ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
    </div>
  );
}

// =============================================================================
// SECTION COMPONENTS
// =============================================================================

export function SectionHeadingSkeleton() {
  return (
    <div className="text-center space-y-4">
      <div className={`h-8 w-64 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      <div className="space-y-2">
        <div className={`h-4 w-96 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-4 w-80 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="text-center space-y-6">
      {/* Quote */}
      <div className="space-y-3">
        <div className={`h-5 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-5 w-full ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-5 w-3/4 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
      
      {/* Author */}
      <div className="space-y-2">
        <div className={`h-16 w-16 rounded-full mx-auto ${SKELETON_BASE}`} />
        <div className={`h-5 w-32 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
        <div className={`h-4 w-24 mx-auto ${SKELETON_ROUNDED} ${SKELETON_BASE}`} />
      </div>
    </div>
  );
}

// =============================================================================
// COMPREHENSIVE PAGE SKELETONS
// =============================================================================

export function HomePageSkeleton() {
  return (
    <div className="space-y-24 lg:space-y-32">
      {/* Hero Section */}
      <HeroSkeleton />
      
      {/* Featured Collections */}
      <div className="container">
        <SectionHeadingSkeleton />
        <div className="mt-16">
          <CollectionSliderSkeleton />
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="container">
        <SectionHeadingSkeleton />
        <div className="mt-16">
          <ProductSliderSkeleton />
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="container">
        <SectionHeadingSkeleton />
        <div className="mt-16">
          <ProductGridSkeleton />
        </div>
      </div>
      
      {/* Blog Section */}
      <div className="container">
        <SectionHeadingSkeleton />
        <div className="mt-16">
          <BlogSkeleton />
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="container">
        <TestimonialSkeleton />
      </div>
    </div>
  );
}
