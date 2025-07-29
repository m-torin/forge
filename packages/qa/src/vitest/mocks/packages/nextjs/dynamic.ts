// Next.js Dynamic Imports mocks
import { vi } from 'vitest';
import { React } from './shared';

// Mock next/dynamic with comprehensive options
vi.mock('next/dynamic', () => {
  const dynamic = vi.fn((importFn: any, options: any = {}) => {
    const { loading: LoadingComponent, ssr = true, suspense = false } = options;

    const DynamicComponent = React.forwardRef(({ ...props }: any, ref: any) => {
      const [Component, setComponent] = React.useState(null);
      const [isLoading, setIsLoading] = React.useState(true);
      const [error, setError] = React.useState(null);

      React.useEffect(() => {
        const loadDynamicComponent = async () => {
          try {
            // Simulate dynamic import
            const mod = await Promise.resolve(importFn());
            // Handle both default and named exports
            const ImportedComponent = mod.default || mod;
            setComponent(() => ImportedComponent);
            setIsLoading(false);
          } catch (err: any) {
            setError(err);
            setIsLoading(false);
          }
        };

        loadDynamicComponent();
      }, []);

      // Handle SSR behavior
      if (typeof window === 'undefined' && !ssr) {
        return null;
      }

      if (error) {
        throw error;
      }

      if (isLoading) {
        return LoadingComponent ? React.createElement(LoadingComponent) : null;
      }

      return Component ? React.createElement(Component, { ...props, ref }) : null;
    });

    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  });

  return dynamic;
});

// Mock dynamic import utilities
export const mockDynamicImport = {
  registeredComponents: new Map(),

  registerComponent: vi.fn((path: string, component: any, options: any = {}) => {
    const componentId = `dynamic-${Math.random().toString(36).substring(2, 15)}`;
    mockDynamicImport.registeredComponents.set(componentId, {
      path,
      component,
      options,
      loaded: false,
      timestamp: Date.now(),
    });
    return componentId;
  }),

  simulateImport: vi.fn((path: string) => {
    return Promise.resolve({
      default: () =>
        React.createElement('div', { 'data-testid': 'dynamic-component' }, 'Dynamic Component'),
      path,
      loaded: true,
    });
  }),

  simulateImportError: vi.fn((path: string) => {
    return Promise.reject(new Error(`Failed to import: ${path}`));
  }),

  simulateNamedImport: vi.fn((path: string, exportName: string) => {
    return Promise.resolve({
      [exportName]: () =>
        React.createElement(
          'div',
          { 'data-testid': 'dynamic-named-component' },
          'Dynamic Named Component',
        ),
      path,
      exportName,
      loaded: true,
    });
  }),
};

// Mock dynamic loading states
export const mockDynamicLoading = {
  loadingStates: new Map(),

  setLoadingState: vi.fn((componentId: string, state: 'loading' | 'loaded' | 'error') => {
    mockDynamicLoading.loadingStates.set(componentId, {
      state,
      timestamp: Date.now(),
    });
  }),

  getLoadingState: vi.fn((componentId: string) => {
    return mockDynamicLoading.loadingStates.get(componentId)?.state || 'idle';
  }),

  clearLoadingStates: vi.fn(() => {
    mockDynamicLoading.loadingStates.clear();
  }),
};

// Dynamic testing utilities
export const dynamicTestUtils = {
  createMockDynamic: (importFn: Function, options: any = {}) => ({
    importFn,
    loading: options.loading,
    ssr: options.ssr !== false,
    suspense: options.suspense || false,
    ...options,
  }),

  simulateDynamicImport: vi.fn(async (importFn: Function) => {
    return await importFn();
  }),

  expectDynamicImport: (importFn: Function) => {
    expect(importFn).toHaveBeenCalledWith();
  },

  expectLoadingComponent: (LoadingComponent: any) => {
    expect(LoadingComponent).toBeTruthy();
  },

  expectSSRBehavior: (ssr: boolean, expectedBehavior: 'render' | 'null') => {
    if (typeof window === 'undefined' && !ssr) {
      expect(expectedBehavior).toBe('null');
    } else {
      expect(expectedBehavior).toBe('render');
    }
  },
};
