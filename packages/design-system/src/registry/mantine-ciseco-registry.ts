/**
 * Mantine Ciseco Component Registry
 *
 * This registry extends and enhances the existing mantine-ciseco components
 * to provide a universal, type-safe component system with advanced features.
 */

import { lazy } from 'react';

import type { ComponentType, LazyExoticComponent } from 'react';

// Component metadata for registry
export interface ComponentMetadata {
  accessibility?: AccessibilityInfo;
  category: ComponentCategory;
  description?: string;
  displayName: string;
  examples?: ComponentExample[];
  name: string;
  props?: Record<string, any>;
  responsive?: boolean;
  tags?: string[];
  variants?: string[];
}

export interface ComponentExample {
  code: string;
  preview?: boolean;
  title: string;
}

export interface AccessibilityInfo {
  ariaAttributes?: string[];
  keyboardNav: boolean;
  screenReaderSupport: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export type ComponentCategory =
  | 'core-ui'
  | 'product'
  | 'collection'
  | 'navigation'
  | 'section'
  | 'filter'
  | 'aside'
  | 'blog'
  | 'gallery'
  | 'shared'
  | 'background'
  | 'icons'
  | 'special';

// Registry entry combining component and metadata
export interface RegistryEntry {
  component: LazyExoticComponent<ComponentType<any>>;
  metadata: ComponentMetadata;
}

// The main registry
class MantineCisecoRegistry {
  private components = new Map<string, RegistryEntry>();
  private categoryIndex = new Map<ComponentCategory, Set<string>>();
  private tagIndex = new Map<string, Set<string>>();

  constructor() {
    this.initializeRegistry();
  }

  /**
   * Register a component with metadata
   */
  register(entry: RegistryEntry): void {
    const { metadata } = entry;

    // Add to main registry
    this.components.set(metadata.name, entry);

    // Update category index
    if (!this.categoryIndex.has(metadata.category)) {
      this.categoryIndex.set(metadata.category, new Set());
    }
    this.categoryIndex.get(metadata.category)!.add(metadata.name);

    // Update tag index
    metadata.tags?.forEach((tag) => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(metadata.name);
    });
  }

  /**
   * Get a component by name
   */
  get(name: string): RegistryEntry | undefined {
    return this.components.get(name);
  }

  /**
   * Get component lazy import only
   */
  getComponent(name: string): LazyExoticComponent<ComponentType<any>> | undefined {
    return this.components.get(name)?.component;
  }

  /**
   * Get all components in a category
   */
  getByCategory(category: ComponentCategory): RegistryEntry[] {
    const names = this.categoryIndex.get(category) || new Set();
    return Array.from(names)
      .map((name) => this.components.get(name)!)
      .filter(Boolean);
  }

  /**
   * Get all components with a specific tag
   */
  getByTag(tag: string): RegistryEntry[] {
    const names = this.tagIndex.get(tag) || new Set();
    return Array.from(names)
      .map((name) => this.components.get(name)!)
      .filter(Boolean);
  }

  /**
   * Search components by name or description
   */
  search(query: string): RegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.components.values()).filter((entry) => {
      const { metadata } = entry;
      return (
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.displayName.toLowerCase().includes(lowerQuery) ||
        metadata.description?.toLowerCase().includes(lowerQuery) ||
        metadata.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Get all registered components
   */
  getAll(): RegistryEntry[] {
    return Array.from(this.components.values());
  }

  /**
   * Initialize with all mantine-ciseco components
   */
  private initializeRegistry(): void {
    // Core UI Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/AccordionInfo')),
      metadata: {
        name: 'AccordionInfo',
        accessibility: {
          ariaAttributes: ['aria-expanded', 'aria-controls'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'core-ui',
        description: 'Expandable accordion component for showing/hiding content',
        displayName: 'Accordion Info',
        responsive: true,
        tags: ['accordion', 'collapse', 'expandable'],
      },
    });

    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/AddToCardButton')),
      metadata: {
        name: 'AddToCardButton',
        accessibility: {
          ariaAttributes: ['aria-label', 'aria-busy'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'product',
        description: 'Button component for adding products to shopping cart with loading states',
        displayName: 'Add to Cart Button',
        responsive: true,
        tags: ['button', 'cart', 'ecommerce', 'action'],
        variants: ['primary', 'secondary', 'outline'],
      },
    });

    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/BagIcon')),
      metadata: {
        name: 'BagIcon',
        accessibility: {
          ariaAttributes: ['aria-label'],
          keyboardNav: false,
          screenReaderSupport: true,
          wcagLevel: 'A',
        },
        category: 'icons',
        description: 'Shopping bag icon with optional item count badge',
        displayName: 'Shopping Bag Icon',
        responsive: false,
        tags: ['icon', 'cart', 'shopping', 'badge'],
      },
    });

    // Product Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/ProductCard')),
      metadata: {
        name: 'ProductCard',
        accessibility: {
          ariaAttributes: ['aria-label', 'role'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'product',
        description: 'Standard product display card with image, price, and quick actions',
        displayName: 'Product Card',
        examples: [
          {
            code: `<ProductCard
  product={{
    name: "Classic T-Shirt",
    price: 29.99,
    image: "/product.jpg"
  }}
/>`,
            preview: true,
            title: 'Basic Product Card',
          },
        ],
        responsive: true,
        tags: ['product', 'card', 'ecommerce', 'shop'],
        variants: ['grid', 'list', 'minimal'],
      },
    });

    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/ProductQuickView')),
      metadata: {
        name: 'ProductQuickView',
        accessibility: {
          ariaAttributes: ['aria-modal', 'aria-labelledby', 'role="dialog"'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'product',
        description: 'Modal component for quick product preview without leaving the page',
        displayName: 'Product Quick View',
        responsive: true,
        tags: ['product', 'modal', 'quickview', 'ecommerce'],
      },
    });

    // Collection Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/CollectionCard1')),
      metadata: {
        name: 'CollectionCard1',
        accessibility: {
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'collection',
        description: 'Collection display card with overlay text and hover effects',
        displayName: 'Collection Card - Style 1',
        responsive: true,
        tags: ['collection', 'card', 'category', 'shop'],
      },
    });

    // Navigation Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/Header/Header')),
      metadata: {
        name: 'Header',
        accessibility: {
          ariaAttributes: ['role="banner"', 'aria-label'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'navigation',
        description: 'Primary site header with logo, navigation, search, and user menu',
        displayName: 'Main Header',
        responsive: true,
        tags: ['header', 'navigation', 'layout', 'responsive'],
      },
    });

    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/Header/Navigation/Navigation')),
      metadata: {
        name: 'Navigation',
        accessibility: {
          ariaAttributes: ['role="navigation"', 'aria-expanded'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'navigation',
        description: 'Main navigation component with dropdown support',
        displayName: 'Navigation Menu',
        responsive: true,
        tags: ['navigation', 'menu', 'dropdown'],
      },
    });

    // Section Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/SectionHero/SectionHero')),
      metadata: {
        name: 'SectionHero',
        accessibility: {
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'section',
        description: 'Full-width hero section with background image and CTA buttons',
        displayName: 'Hero Section',
        responsive: true,
        tags: ['hero', 'section', 'landing', 'marketing'],
        variants: ['default', 'video', 'slider'],
      },
    });

    // Filter Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/ArchiveFilterListBox')),
      metadata: {
        name: 'ArchiveFilterListBox',
        accessibility: {
          ariaAttributes: ['role="listbox"', 'aria-multiselectable'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'filter',
        description: 'Filterable list box for categories and archives',
        displayName: 'Archive Filter List',
        responsive: true,
        tags: ['filter', 'list', 'category', 'search'],
      },
    });

    // Blog Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/blog/PostCard1')),
      metadata: {
        name: 'PostCard1',
        accessibility: {
          ariaAttributes: ['role="article"'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'blog',
        description: 'Blog post preview card with featured image and metadata',
        displayName: 'Blog Post Card - Style 1',
        responsive: true,
        tags: ['blog', 'post', 'card', 'article'],
      },
    });

    // Gallery Components
    this.register({
      component: lazy(
        () => import('../../mantine-ciseco/components/listing-image-gallery/ListingImageGallery'),
      ),
      metadata: {
        name: 'ListingImageGallery',
        accessibility: {
          ariaAttributes: ['role="img"', 'aria-label'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'gallery',
        description: 'Product image gallery with thumbnails and lightbox',
        displayName: 'Image Gallery',
        responsive: true,
        tags: ['gallery', 'images', 'lightbox', 'product'],
      },
    });

    // Shared Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/shared/Button/Button')),
      metadata: {
        name: 'Button',
        accessibility: {
          ariaAttributes: ['aria-label', 'aria-pressed', 'aria-disabled'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'shared',
        description: 'Universal button component with multiple variants and states',
        displayName: 'Button',
        responsive: true,
        tags: ['button', 'action', 'form'],
        variants: ['primary', 'secondary', 'outline', 'ghost'],
      },
    });

    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/shared/Avatar/Avatar')),
      metadata: {
        name: 'Avatar',
        accessibility: {
          ariaAttributes: ['alt', 'role="img"'],
          keyboardNav: false,
          screenReaderSupport: true,
          wcagLevel: 'A',
        },
        category: 'shared',
        description: 'User avatar component with image or initials fallback',
        displayName: 'Avatar',
        responsive: false,
        tags: ['avatar', 'user', 'profile'],
      },
    });

    // Like/Favorite Components
    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/LikeButton')),
      metadata: {
        name: 'LikeButton',
        accessibility: {
          ariaAttributes: ['aria-label', 'aria-pressed'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'product',
        description: 'Heart-shaped like/favorite button',
        displayName: 'Like Button',
        responsive: false,
        tags: ['favorite', 'wishlist', 'like', 'heart'],
      },
    });

    this.register({
      component: lazy(() => import('../../mantine-ciseco/components/LikeSaveBtns')),
      metadata: {
        name: 'LikeSaveBtns',
        accessibility: {
          ariaAttributes: ['aria-label'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'product',
        description: 'Combined share and save/favorite buttons',
        displayName: 'Like & Save Buttons',
        responsive: false,
        tags: ['share', 'save', 'favorite', 'social'],
      },
    });

    // Context-Aware Variants
    this.register({
      component: lazy(() =>
        import('./context-aware-components').then((m) => ({ default: m.ContextAwareLikeButton })),
      ),
      metadata: {
        name: 'ContextAwareLikeButton',
        accessibility: {
          ariaAttributes: ['aria-label', 'aria-pressed'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'product',
        description: 'Like button that integrates with app contexts (favorites, wishlist)',
        displayName: 'Context-Aware Like Button',
        responsive: false,
        tags: ['favorite', 'wishlist', 'like', 'heart', 'context'],
      },
    });

    this.register({
      component: lazy(() =>
        import('./context-aware-components').then((m) => ({ default: m.ContextAwareLikeSaveBtns })),
      ),
      metadata: {
        name: 'ContextAwareLikeSaveBtns',
        accessibility: {
          ariaAttributes: ['aria-label'],
          keyboardNav: true,
          screenReaderSupport: true,
          wcagLevel: 'AA',
        },
        category: 'product',
        description: 'Share and save buttons that integrate with app contexts',
        displayName: 'Context-Aware Like & Save Buttons',
        responsive: false,
        tags: ['share', 'save', 'favorite', 'social', 'context'],
      },
    });

    // Add all remaining 100+ components...
    // This is a sample - in practice, you'd add all components with their metadata
  }
}

// Create and export singleton instance
export const registry = new MantineCisecoRegistry();

// Convenience exports
export const getComponent = (name: string) => registry.getComponent(name);
export const getComponentWithMetadata = (name: string) => registry.get(name);
export const getComponentsByCategory = (category: ComponentCategory) =>
  registry.getByCategory(category);
export const getComponentsByTag = (tag: string) => registry.getByTag(tag);
export const searchComponents = (query: string) => registry.search(query);
export const getAllComponents = () => registry.getAll();
