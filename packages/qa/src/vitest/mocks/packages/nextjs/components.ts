// Next.js UI Components mocks
import { vi } from 'vitest';
import { React } from './shared';

// Next.js Image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    _priority,
    fill,
    _sizes,
    className,
    style,
    'data-testid': testId,
    ...props
  }: any) =>
    React.createElement('img', {
      src: typeof src === 'object' ? src.src || src.default : src,
      alt: alt || '',
      className,
      style: fill ? { ...style, position: 'absolute', inset: 0 } : style,
      'data-testid': testId || 'next-image',
      // Filter out Next.js specific props that shouldn't be passed to DOM
      // priority, fill, sizes are Next.js specific and don't go to DOM
      ...Object.fromEntries(
        Object.entries(props).filter(
          ([key]) =>
            ![
              'priority',
              'fill',
              'sizes',
              'loader',
              'quality',
              'placeholder',
              'blurDataURL',
            ].includes(key),
        ),
      ),
    }),
}));

// Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    as,
    prefetch = true,
    replace = false,
    scroll = true,
    shallow = false,
    locale,
    'data-testid': testId,
    ...props
  }: any) => {
    // Handle the 'as' prop for middleware rewrites
    const displayHref = as || href;

    // Mock prefetch behavior
    React.useEffect(() => {
      if (prefetch && typeof href === 'string') {
        // Simulate prefetch request
        mockLinkPrefetch.simulatePrefetch(href);
      }
    }, [prefetch, href]);

    return React.createElement(
      'a',
      {
        href: displayHref,
        'data-href': href, // Store the actual href for testing
        'data-as': as, // Store the as prop for testing
        'data-prefetch': prefetch,
        'data-replace': replace,
        'data-scroll': scroll,
        'data-shallow': shallow,
        'data-locale': locale,
        'data-testid': testId || 'next-link',
        // Mock click handler for navigation
        onClick: vi.fn(e => {
          // Prevent default navigation in tests
          e.preventDefault();

          // Call onNavigate callback if provided
          if (props.onNavigate) {
            props.onNavigate(href, as);
          }

          // Mock router navigation
          if (typeof window !== 'undefined' && window.history) {
            const targetUrl = displayHref;
            if (replace) {
              window.history.replaceState({}, '', targetUrl);
            } else {
              window.history.pushState({}, '', targetUrl);
            }
          }
        }),
        ...props,
      },
      children,
    );
  },
}));

// Next.js Script
vi.mock('next/script', () => ({
  default: ({
    src,
    strategy = 'afterInteractive',
    onLoad,
    onError,
    onReady,
    id,
    nonce,
    'data-testid': testId,
    children,
    ...props
  }: any) => {
    // Mock script loading behavior
    React.useEffect(() => {
      if (onReady) {
        // Simulate script ready
        setTimeout(() => onReady(), 0);
      }
      if (onLoad) {
        // Simulate script load
        setTimeout(() => onLoad(), 0);
      }
    }, [onReady, onLoad]);

    return React.createElement(
      'script',
      {
        src,
        id,
        nonce,
        'data-strategy': strategy,
        'data-testid': testId || 'next-script',
        ...props,
      },
      children,
    );
  },
}));

// Next.js Dynamic
vi.mock('next/dynamic', () => {
  const dynamic = vi.fn((dynamicImport: any, options: any = {}) => {
    const { loading: LoadingComponent, ssr = true, suspense = false } = options;

    const DynamicComponent = ({ ...props }: any) => {
      const [Component, setComponent] = React.useState(null);
      const [isLoading, setIsLoading] = React.useState(true);
      const [error, setError] = React.useState(null);

      React.useEffect(() => {
        const loadComponent = async () => {
          try {
            const mod = await dynamicImport();
            setComponent(() => mod.default || mod);
            setIsLoading(false);
          } catch (err: any) {
            setError(err);
            setIsLoading(false);
          }
        };

        loadComponent();
      }, []);

      if (error) {
        throw error;
      }

      if (isLoading) {
        return LoadingComponent ? React.createElement(LoadingComponent) : null;
      }

      return Component ? React.createElement(Component, props) : null;
    };

    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  });

  return dynamic;
});

// Server Actions and Form Component
vi.mock('next/form', () => ({
  default: ({
    children,
    action,
    method = 'GET',
    replace = false,
    scroll = true,
    prefetch = true,
    'data-testid': testId,
    ...props
  }: any) => {
    const handleSubmit = vi.fn(e => {
      e.preventDefault();

      if (typeof action === 'function') {
        // Server Action
        const formData = new FormData(e.target);
        return action(formData);
      } else if (typeof action === 'string') {
        // String action - mock navigation
        if (method === 'GET') {
          const url = new URL(action, 'http://localhost:3000');
          const formData = new FormData(e.target);

          // Convert form data to search params for GET
          for (const [key, value] of formData.entries()) {
            if (typeof value === 'string') {
              url.searchParams.set(key, value);
            }
          }

          if (typeof window !== 'undefined' && window.history) {
            if (replace) {
              window.history.replaceState({}, '', url.toString());
            } else {
              window.history.pushState({}, '', url.toString());
            }
          }
        }
      }
    });

    return React.createElement(
      'form',
      {
        onSubmit: handleSubmit,
        method,
        action: typeof action === 'string' ? action : undefined,
        'data-testid': testId || 'next-form',
        'data-prefetch': prefetch,
        'data-replace': replace,
        'data-scroll': scroll,
        ...props,
      },
      children,
    );
  },
}));

// Next.js Head (for Pages Router)
vi.mock('next/head', () => ({
  default: ({ children, ...props }: any) => {
    // Mock Head component that doesn't actually modify document head
    return React.createElement(
      'head',
      {
        'data-testid': 'next-head',
        ...props,
      },
      children,
    );
  },
}));

// Mock Link prefetch utilities
export const mockLinkPrefetch = {
  prefetchedUrls: new Set(),

  simulatePrefetch: vi.fn((href: string) => {
    mockLinkPrefetch.prefetchedUrls.add(href);
    return Promise.resolve({
      href,
      prefetched: true,
      timestamp: Date.now(),
    });
  }),

  isPrefetched: vi.fn((href: string) => {
    return mockLinkPrefetch.prefetchedUrls.has(href);
  }),

  clearPrefetchCache: vi.fn(() => {
    mockLinkPrefetch.prefetchedUrls.clear();
  }),

  getPrefetchedUrls: vi.fn(() => {
    return Array.from(mockLinkPrefetch.prefetchedUrls);
  }),
};

// Mock Link status utilities
export const mockLinkStatus = {
  activeLinks: new Map(),

  registerLink: vi.fn((href: string, options: any = {}) => {
    const linkId = `link-${Math.random().toString(36).substring(2, 15)}`;
    mockLinkStatus.activeLinks.set(linkId, {
      href,
      status: 'idle',
      options,
      timestamp: Date.now(),
    });
    return linkId;
  }),

  updateLinkStatus: vi.fn((linkId: string, status: 'loading' | 'ready' | 'error') => {
    const link = mockLinkStatus.activeLinks.get(linkId);
    if (link) {
      link.status = status;
      link.timestamp = Date.now();
    }
  }),

  getLinkStatus: vi.fn((href: string) => {
    for (const [_, link] of mockLinkStatus.activeLinks) {
      if (link.href === href) {
        return {
          isLoading: link.status === 'loading',
          isReady: link.status === 'ready',
          isPending: link.status === 'loading',
          error: link.status === 'error' ? new Error('Link error') : null,
        };
      }
    }
    return {
      isLoading: false,
      isReady: false,
      isPending: false,
      error: null,
    };
  }),

  clearLinkStatus: vi.fn(() => {
    mockLinkStatus.activeLinks.clear();
  }),
};

// Mock Image optimization utilities
export const mockImageOptimization = {
  optimizeImage: vi.fn((src: string, options: any = {}) => {
    const { width, height, quality = 75, format = 'webp' } = options;
    return {
      src: `${src}?w=${width}&h=${height}&q=${quality}&f=${format}`,
      optimized: true,
      format,
      quality,
      width,
      height,
    };
  }),

  generateBlurDataURL: vi.fn((src: string) => {
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f0f0f0"/></svg>`,
    )}`;
  }),

  simulateImageLoad: vi.fn((src: string) => {
    return Promise.resolve({
      src,
      loaded: true,
      naturalWidth: 1200,
      naturalHeight: 800,
      complete: true,
    });
  }),

  simulateImageError: vi.fn((src: string) => {
    return Promise.reject(new Error(`Failed to load image: ${src}`));
  }),
};

// Mock Form utilities
export const mockFormUtils = {
  createFormData: vi.fn((data: Record<string, any>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item.toString()));
      } else {
        formData.append(key, value.toString());
      }
    });
    return formData;
  }),

  serializeFormData: vi.fn((formData: FormData) => {
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    return data;
  }),

  simulateFormSubmission: vi.fn(async (action: Function | string, formData: FormData) => {
    if (typeof action === 'function') {
      // Server Action
      return await action(formData);
    } else {
      // String action - simulate HTTP request
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        url: action,
        data: mockFormUtils.serializeFormData(formData),
      };
    }
  }),
};

// Mock Script utilities
export const mockScriptUtils = {
  loadedScripts: new Set(),

  simulateScriptLoad: vi.fn((src: string) => {
    mockScriptUtils.loadedScripts.add(src);
    return Promise.resolve({
      src,
      loaded: true,
      timestamp: Date.now(),
    });
  }),

  simulateScriptError: vi.fn((src: string) => {
    return Promise.reject(new Error(`Failed to load script: ${src}`));
  }),

  isScriptLoaded: vi.fn((src: string) => {
    return mockScriptUtils.loadedScripts.has(src);
  }),

  getLoadedScripts: vi.fn(() => {
    return Array.from(mockScriptUtils.loadedScripts);
  }),

  clearLoadedScripts: vi.fn(() => {
    mockScriptUtils.loadedScripts.clear();
  }),
};

// Mock Dynamic component utilities
export const mockDynamicUtils = {
  dynamicComponents: new Map(),

  registerDynamicComponent: vi.fn((componentPath: string, options: any = {}) => {
    const componentId = `dynamic-${Math.random().toString(36).substring(2, 15)}`;
    mockDynamicUtils.dynamicComponents.set(componentId, {
      path: componentPath,
      options,
      loaded: false,
      timestamp: Date.now(),
    });
    return componentId;
  }),

  simulateDynamicLoad: vi.fn((componentId: string) => {
    const component = mockDynamicUtils.dynamicComponents.get(componentId);
    if (component) {
      component.loaded = true;
      component.timestamp = Date.now();
    }
    return Promise.resolve(component);
  }),

  getDynamicComponents: vi.fn(() => {
    return Array.from(mockDynamicUtils.dynamicComponents.entries());
  }),

  clearDynamicComponents: vi.fn(() => {
    mockDynamicUtils.dynamicComponents.clear();
  }),
};

// Component testing utilities
export const componentTestUtils = {
  // Link testing
  createMockLink: (href: string, options: any = {}) => ({
    href,
    as: options.as,
    prefetch: options.prefetch !== false,
    replace: options.replace || false,
    scroll: options.scroll !== false,
    shallow: options.shallow || false,
    locale: options.locale,
    ...options,
  }),

  expectLinkPrefetch: (href: string, shouldPrefetch: boolean = true) => {
    if (shouldPrefetch) {
      expect(mockLinkPrefetch.isPrefetched(href)).toBeTruthy();
    } else {
      expect(mockLinkPrefetch.isPrefetched(href)).toBeFalsy();
    }
  },

  expectLinkNavigation: (href: string, as?: string) => {
    const targetUrl = as || href;
    expect(window.history.pushState).toHaveBeenCalledWith({}, '', targetUrl);
  },

  // Image testing
  createMockImage: (src: string, options: any = {}) => ({
    src,
    alt: options.alt || '',
    width: options.width,
    height: options.height,
    fill: options.fill || false,
    priority: options.priority || false,
    quality: options.quality || 75,
    ...options,
  }),

  expectImageOptimization: (src: string, expectedOptions: any) => {
    expect(mockImageOptimization.optimizeImage).toHaveBeenCalledWith(
      src,
      expect.objectContaining(expectedOptions),
    );
  },

  // Form testing
  createMockForm: (action: Function | string, options: any = {}) => ({
    action,
    method: options.method || 'POST',
    replace: options.replace || false,
    scroll: options.scroll !== false,
    prefetch: options.prefetch !== false,
    ...options,
  }),

  expectFormSubmission: (action: Function | string, expectedData: any) => {
    if (typeof action === 'function') {
      expect(action).toHaveBeenCalledWith(expect.any(FormData));
    } else {
      expect(mockFormUtils.simulateFormSubmission).toHaveBeenCalledWith(
        action,
        expect.any(FormData),
      );
    }
  },

  // Script testing
  createMockScript: (src: string, options: any = {}) => ({
    src,
    strategy: options.strategy || 'afterInteractive',
    onLoad: options.onLoad,
    onError: options.onError,
    onReady: options.onReady,
    id: options.id,
    nonce: options.nonce,
    ...options,
  }),

  expectScriptLoad: (src: string, shouldLoad: boolean = true) => {
    if (shouldLoad) {
      expect(mockScriptUtils.isScriptLoaded(src)).toBeTruthy();
    } else {
      expect(mockScriptUtils.isScriptLoaded(src)).toBeFalsy();
    }
  },

  // Dynamic component testing
  createMockDynamic: (importFn: Function, options: any = {}) => ({
    importFn,
    loading: options.loading,
    ssr: options.ssr !== false,
    suspense: options.suspense || false,
    ...options,
  }),

  expectDynamicLoad: (componentId: string, shouldLoad: boolean = true) => {
    const component = mockDynamicUtils.dynamicComponents.get(componentId);
    if (shouldLoad) {
      expect(component?.loaded).toBeTruthy();
    } else {
      expect(component?.loaded).toBeFalsy();
    }
  },
};
