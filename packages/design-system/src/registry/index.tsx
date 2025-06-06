/**
 * Universal Component Registry for Mantine Ciseco
 *
 * This is the main entry point for the universal component system.
 * It extends and enhances the mantine-ciseco components with:
 * - Lazy loading and code splitting
 * - Type-safe component resolution
 * - Metadata and discovery
 * - Intelligent loading states
 * - Component documentation
 */

// Re-export the registry and utilities
export * from './mantine-ciseco-registry';
export * from './universal-mantine';

// Re-export pre-configured components for convenience
export { Components, UC } from './universal-mantine';

// Component creation utilities
export { createComponent } from './universal-mantine';

// Metadata hooks
export { useComponentMetadata } from './universal-mantine';

/**
 * Quick Start Guide
 *
 * 1. Import the universal component:
 * ```tsx
 * import { UC } from '@repo/design-system/registry';
 *
 * // Use any mantine-ciseco component
 * <UC is="ProductCard" product={product} />
 * <UC is="Button" variant="primary">Click me</UC>
 * ```
 *
 * 2. Use pre-configured typed components:
 * ```tsx
 * import { Components } from '@repo/design-system/registry';
 * const { ProductCard, Button, Header } = Components;
 *
 * <ProductCard product={product} />
 * <Button variant="primary">Click me</Button>
 * ```
 *
 * 3. Create custom typed components:
 * ```tsx
 * import { createComponent } from '@repo/design-system/registry';
 *
 * interface MyButtonProps {
 *   variant: 'primary' | 'secondary';
 *   children: ReactNode;
 * }
 *
 * export const MyButton = createComponent<MyButtonProps>('Button');
 * ```
 *
 * 4. Discover components:
 * ```tsx
 * import { getComponentsByCategory, searchComponents } from '@repo/design-system/registry';
 *
 * // Get all product components
 * const productComponents = getComponentsByCategory('product');
 *
 * // Search for components
 * const cardComponents = searchComponents('card');
 * ```
 */

// Default export for convenience
export default {
  Components,
  createComponent,
  getAllComponents,
  getComponentsByCategory,
  getComponentsByTag,
  searchComponents,
  UC,
  useComponentMetadata,
} as const;
