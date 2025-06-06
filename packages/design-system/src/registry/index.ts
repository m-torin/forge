/**
 * Universal Component Registry
 *
 * This registry provides a unified interface for component resolution across
 * multiple component systems (Mantine-Ciseco and UIX/Shadcn).
 *
 * Features:
 * - Dynamic component resolution based on context
 * - Lazy loading for optimal performance
 * - Type-safe component imports
 * - Theme-aware component selection
 * - E-commerce optimized components
 */

import { lazy } from 'react';

import type { ComponentType, LazyExoticComponent } from 'react';

// Component registry types
export type ComponentSystem = 'mantine-ciseco' | 'uix' | 'auto';
export type ComponentCategory =
  | 'core'
  | 'product'
  | 'collection'
  | 'navigation'
  | 'section'
  | 'filter'
  | 'form'
  | 'layout'
  | 'feedback';

export interface ComponentRegistryEntry {
  category: ComponentCategory;
  defaultSystem?: ComponentSystem;
  description?: string;
  name: string;
  props?: Record<string, any>;
  systems: {
    'mantine-ciseco'?: LazyExoticComponent<ComponentType<any>>;
    uix?: LazyExoticComponent<ComponentType<any>>;
  };
}

export interface RegistryConfig {
  enableDevTools?: boolean;
  enableLazyLoading?: boolean;
  fallbackSystem?: ComponentSystem;
  onComponentLoad?: (name: string, system: ComponentSystem) => void;
  preferredSystem?: ComponentSystem;
}

// Component Registry Map
const componentRegistry = new Map<string, ComponentRegistryEntry>();

// Registry configuration
let registryConfig: RegistryConfig = {
  enableDevTools: process.env.NODE_ENV === 'development',
  enableLazyLoading: true,
  fallbackSystem: 'mantine-ciseco',
  preferredSystem: 'auto',
};

/**
 * Register a component in the universal registry
 */
export function registerComponent(entry: ComponentRegistryEntry): void {
  componentRegistry.set(entry.name, entry);

  if (registryConfig.enableDevTools) {
    console.log(`[Registry] Registered component: ${entry.name}`);
  }
}

/**
 * Register multiple components at once
 */
export function registerComponents(entries: ComponentRegistryEntry[]): void {
  entries.forEach(registerComponent);
}

/**
 * Configure the registry
 */
export function configureRegistry(config: Partial<RegistryConfig>): void {
  registryConfig = { ...registryConfig, ...config };
}

/**
 * Get a component from the registry
 */
export function getComponent<T = any>(
  name: string,
  preferredSystem?: ComponentSystem,
): LazyExoticComponent<ComponentType<T>> | null {
  const entry = componentRegistry.get(name);

  if (!entry) {
    console.warn(`[Registry] Component not found: ${name}`);
    return null;
  }

  // Determine which system to use
  const system = preferredSystem || entry.defaultSystem || registryConfig.preferredSystem;

  // Get component based on system preference
  let component: LazyExoticComponent<ComponentType<T>> | undefined;

  if (system === 'auto') {
    // Auto-select based on availability and context
    component = entry.systems['mantine-ciseco'] || entry.systems['uix'];
  } else {
    // Try preferred system first, then fallback
    component =
      entry.systems[system as keyof typeof entry.systems] ||
      entry.systems[registryConfig.fallbackSystem as keyof typeof entry.systems];
  }

  if (component && registryConfig.onComponentLoad) {
    const resolvedSystem = entry.systems['mantine-ciseco'] === component ? 'mantine-ciseco' : 'uix';
    registryConfig.onComponentLoad(name, resolvedSystem);
  }

  return component || null;
}

/**
 * Check if a component exists in the registry
 */
export function hasComponent(name: string): boolean {
  return componentRegistry.has(name);
}

/**
 * Get all registered components
 */
export function getAllComponents(): ComponentRegistryEntry[] {
  return Array.from(componentRegistry.values());
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: ComponentCategory): ComponentRegistryEntry[] {
  return Array.from(componentRegistry.values()).filter((entry) => entry.category === category);
}

/**
 * Clear the registry (useful for testing)
 */
export function clearRegistry(): void {
  componentRegistry.clear();
}

// Initialize core components
registerComponents([
  // Core UI Components
  {
    name: 'Button',
    category: 'core',
    defaultSystem: 'uix',
    description: 'Universal button component with multiple variants',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/shared/Button/Button')),
      uix: lazy(() => import('../../uix/components/ui/button-wrapper')),
    },
  },
  {
    name: 'Input',
    category: 'core',
    defaultSystem: 'uix',
    description: 'Universal input component with validation support',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/shared/Input/Input')),
      uix: lazy(() => import('../../uix/components/ui/input-wrapper')),
    },
  },
  {
    name: 'Card',
    category: 'core',
    defaultSystem: 'uix',
    description: 'Universal card container component',
    systems: {
      // Note: Card is typically a Mantine core component
      uix: lazy(() => import('../../uix/components/ui/card-wrapper')),
    },
  },

  // Product Components
  {
    name: 'ProductCard',
    category: 'product',
    defaultSystem: 'mantine-ciseco', // E-commerce specific, use specialized version
    description: 'Product display card with image, price, and actions',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/ProductCard')),
    },
  },
  {
    name: 'ProductQuickView',
    category: 'product',
    defaultSystem: 'mantine-ciseco',
    description: 'Modal for quick product preview',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/ProductQuickView')),
    },
  },
  {
    name: 'AddToCartButton',
    category: 'product',
    defaultSystem: 'mantine-ciseco',
    description: 'Add to cart button with loading and success states',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/AddToCardButton')),
    },
  },

  // Navigation Components
  {
    name: 'Header',
    category: 'navigation',
    defaultSystem: 'mantine-ciseco',
    description: 'Main site header with navigation and user menu',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/Header/Header')),
    },
  },
  {
    name: 'Navigation',
    category: 'navigation',
    defaultSystem: 'mantine-ciseco',
    description: 'Main navigation menu component',
    systems: {
      'mantine-ciseco': lazy(
        () => import('../../mantine-ciseco/components/Header/Navigation/Navigation'),
      ),
    },
  },

  // Form Components
  {
    name: 'Form',
    category: 'form',
    defaultSystem: 'uix',
    description: 'Form container with validation support',
    systems: {
      uix: lazy(() => import('../../uix/components/ui/form-wrapper')),
    },
  },
  {
    name: 'Select',
    category: 'form',
    defaultSystem: 'uix',
    description: 'Select dropdown component',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/shared/Select/Select')),
      uix: lazy(() => import('../../uix/components/ui/select-wrapper')),
    },
  },

  // Layout Components
  // Note: Container and Grid are typically handled via Mantine's core components
  // or CSS classes rather than custom components

  // Feedback Components
  {
    name: 'Alert',
    category: 'feedback',
    defaultSystem: 'uix',
    description: 'Alert notification component',
    systems: {
      'mantine-ciseco': lazy(() => import('../../mantine-ciseco/components/shared/Alert/Alert')),
      uix: lazy(() => import('../../uix/components/ui/alert-wrapper')),
    },
  },
  // Note: Toast notifications are handled via @repo/notifications package
]);

// Export registry instance for direct access if needed
export const registry = {
  clear: clearRegistry,
  configure: configureRegistry,
  get: getComponent,
  getAll: getAllComponents,
  getByCategory: getComponentsByCategory,
  has: hasComponent,
  register: registerComponent,
  registerMany: registerComponents,
};

// Types are already exported as interfaces above
