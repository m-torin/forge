'use client';

import { forwardRef, Suspense, useMemo } from 'react';

import { useComponent, useRegistry } from './provider';

import type { ComponentSystem } from './index';
import type { ComponentPropsWithRef, ComponentType, ReactElement } from 'react';

interface UniversalComponentProps<P> {
  /**
   * The name of the component to render from the registry
   */
  component: string;

  /**
   * Override the system selection for this specific instance
   */
  system?: ComponentSystem;

  /**
   * Props to pass to the resolved component
   */
  componentProps?: Record<string, any>;

  /**
   * Custom loading component
   */
  loading?: ReactElement;

  /**
   * Custom error component
   */
  error?: ReactElement | ((error: Error) => ReactElement);

  /**
   * Whether to show system info in development
   */
  showSystemInfo?: boolean;
}

/**
 * Universal Component
 *
 * Dynamically renders components from the registry based on the current system preference.
 * This component handles lazy loading, error states, and system resolution automatically.
 *
 * @example
 * ```tsx
 * // Automatically uses the preferred system
 * <UniversalComponent component="Button" componentProps={{ children: "Click me" }} />
 *
 * // Force a specific system
 * <UniversalComponent component="ProductCard" system="mantine-ciseco" componentProps={product} />
 * ```
 */
export const UniversalComponent = forwardRef<any, UniversalComponentProps<any>>(
  (
    {
      component,
      componentProps = {},
      error,
      loading = <div>Loading...</div>,
      showSystemInfo = false,
      system,
    },
    ref,
  ) => {
    const { preferredSystem } = useRegistry();
    const Component = useComponent(component, system);
    const resolvedSystem = system || preferredSystem;

    const errorComponent = useMemo(() => {
      if (!Component) {
        const err = new Error(`Component "${component}" not found in registry`);
        return typeof error === 'function'
          ? error(err)
          : error || <div>Component not found: {component}</div>;
      }
      return null;
    }, [Component, component, error]);

    if (errorComponent) {
      return errorComponent;
    }

    return (
      <>
        {showSystemInfo && process.env.NODE_ENV === 'development' && (
          <div
            style={{
              background: 'rgba(0,0,0,0.5)',
              color: 'white',
              fontSize: '10px',
              padding: '2px 4px',
              pointerEvents: 'none',
              position: 'absolute',
              right: 0,
              top: 0,
              zIndex: 9999,
            }}
          >
            {resolvedSystem}
          </div>
        )}
        <Suspense fallback={loading}>
          {Component && <Component ref={ref} {...componentProps} />}
        </Suspense>
      </>
    );
  },
);

UniversalComponent.displayName = 'UniversalComponent';

/**
 * Create a typed universal component factory
 *
 * This allows you to create strongly-typed universal components for specific registry entries.
 *
 * @example
 * ```tsx
 * // Create a typed Button component
 * const Button = createUniversalComponent<ButtonProps>('Button');
 *
 * // Use it with full type safety
 * <Button variant="primary" onClick={() => {}}>Click me</Button>
 * ```
 */
export function createUniversalComponent<P extends object>(
  componentName: string,
  defaultSystem?: ComponentSystem,
): ComponentType<UniversalComponentProps<P>> {
  const TypedUniversalComponent = forwardRef<any, UniversalComponentProps<P>>(
    ({ system, ...props }, ref) => {
      return (
        <UniversalComponent
          ref={ref}
          component={componentName}
          componentProps={props as Record<string, any>}
          system={system || defaultSystem}
        />
      );
    },
  );

  TypedUniversalComponent.displayName = `Universal${componentName}`;

  return TypedUniversalComponent as unknown as ComponentType<UniversalComponentProps<P>>;
}

/**
 * Hook to create dynamic universal components
 *
 * Useful for programmatically rendering components based on runtime conditions.
 *
 * @example
 * ```tsx
 * const DynamicComponent = useDynamicComponent(
 *   isProductView ? 'ProductCard' : 'CollectionCard'
 * );
 *
 * return <DynamicComponent {...props} />;
 * ```
 */
export function useDynamicComponent(
  componentName: string | null,
  defaultSystem?: ComponentSystem,
): ComponentType<any> | null {
  return useMemo(() => {
    if (!componentName) return null;
    return createUniversalComponent(componentName, defaultSystem);
  }, [componentName, defaultSystem]);
}

/**
 * Component factory with system preference
 *
 * Creates a component that always uses a specific system, regardless of the global preference.
 *
 * @example
 * ```tsx
 * // Always use Mantine version of ProductCard
 * const MantineProductCard = withSystem('ProductCard', 'mantine-ciseco');
 * ```
 */
export function withSystem<P extends object>(
  componentName: string,
  system: ComponentSystem,
): ComponentType<P> {
  return createUniversalComponent<P>(componentName, system) as unknown as ComponentType<P>;
}

// Pre-configured universal components for common use cases
export const Button = createUniversalComponent<ComponentPropsWithRef<'button'>>('Button');
export const Input = createUniversalComponent<ComponentPropsWithRef<'input'>>('Input');
export const Card = createUniversalComponent<Record<string, any>>('Card');
export const Form = createUniversalComponent<ComponentPropsWithRef<'form'>>('Form');
export const Select = createUniversalComponent<Record<string, any>>('Select');
export const ProductCard = createUniversalComponent<Record<string, any>>('ProductCard');
export const Header = createUniversalComponent<any>('Header');
export const Navigation = createUniversalComponent<any>('Navigation');
