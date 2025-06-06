'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { Suspense, useEffect, useState } from 'react';

import { configureRegistry, getComponent, getComponentsByCategory, hasComponent } from './index';

import type {
  ComponentCategory,
  ComponentRegistryEntry,
  ComponentSystem,
  RegistryConfig,
} from './index';
import type { ReactNode } from 'react';

interface RegistryContextValue {
  config: RegistryConfig;
  getComponent: <T extends object>(
    name: string,
    overrideSystem?: ComponentSystem,
  ) => React.LazyExoticComponent<React.ComponentType<T>> | null;
  getComponentsByCategory: (category: ComponentCategory) => ComponentRegistryEntry[];
  hasComponent: (name: string) => boolean;
  preferredSystem: ComponentSystem;
  setPreferredSystem: (system: ComponentSystem) => void;
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

export interface RegistryProviderProps {
  children: ReactNode;
  config?: Partial<RegistryConfig>;
  initialSystem?: ComponentSystem;
}

/**
 * Registry Provider Component
 * Provides registry context to all child components
 */
export function RegistryProvider({
  children,
  config = {},
  initialSystem = 'auto',
}: RegistryProviderProps) {
  const [preferredSystem, setPreferredSystem] = useState<ComponentSystem>(initialSystem);

  // Configure registry on mount and when config changes
  useEffect(() => {
    configureRegistry({
      ...config,
      preferredSystem,
    });
  }, [config, preferredSystem]);

  // Memoized context value
  const contextValue = useMemo<RegistryContextValue>(
    () => ({
      config: {
        enableDevTools: process.env.NODE_ENV === 'development',
        enableLazyLoading: true,
        fallbackSystem: 'mantine-ciseco',
        preferredSystem,
        ...config,
      },
      getComponent: (name, overrideSystem) => getComponent(name, overrideSystem || preferredSystem),
      getComponentsByCategory,
      hasComponent,
      preferredSystem,
      setPreferredSystem,
    }),
    [preferredSystem, config],
  );

  return <RegistryContext.Provider value={contextValue}>{children}</RegistryContext.Provider>;
}

/**
 * Hook to access the registry context
 */
export function useRegistry() {
  const context = useContext(RegistryContext);

  if (!context) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }

  return context;
}

/**
 * Hook to get a component from the registry
 */
export function useComponent<T extends object>(
  name: string,
  overrideSystem?: ComponentSystem,
): React.LazyExoticComponent<React.ComponentType<T>> | null {
  const { getComponent } = useRegistry();
  return getComponent<T>(name, overrideSystem);
}

/**
 * Hook to dynamically import and render a component
 */
export function useRegistryComponent<T extends object>(
  name: string,
  props?: T,
  overrideSystem?: ComponentSystem,
) {
  const Component = useComponent<T>(name, overrideSystem);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Component) {
      setIsLoading(false);
    } else {
      setError(new Error(`Component "${name}" not found in registry`));
      setIsLoading(false);
    }
  }, [Component, name]);

  const render = useCallback(() => {
    if (error) {
      return <div>Error: {error.message}</div>;
    }

    if (isLoading) {
      return <div>Loading component...</div>;
    }

    if (!Component) {
      return null;
    }

    return (
      <Suspense fallback={<div>Loading {name}...</div>}>
        <Component {...(props as T)} />
      </Suspense>
    );
  }, [Component, error, isLoading, name, props]);

  return {
    Component,
    error,
    isLoading,
    render,
  };
}

// Re-export types
export type { ComponentRegistryEntry, ComponentSystem, RegistryConfig } from './index';
