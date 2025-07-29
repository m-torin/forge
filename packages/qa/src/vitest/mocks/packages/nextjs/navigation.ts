// Next.js App Router Navigation mocks
import { vi } from 'vitest';
import { createMockSearchParams } from './shared';

// Next.js Navigation
vi.mock('next/navigation', () => {
  // Mock router with enhanced functionality
  const createMockRouter = () => ({
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn((href: string, options?: { scroll?: boolean }) => {
      // Mock navigation behavior
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', href);
      }
    }),
    replace: vi.fn((href: string, options?: { scroll?: boolean }) => {
      // Mock navigation behavior
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', href);
      }
    }),
    refresh: vi.fn(),
    prefetch: vi.fn((href: string, options?: { kind?: 'auto' | 'full' | 'temporary' }) => {
      // Mock prefetch behavior
      return Promise.resolve();
    }),
  });

  return {
    useRouter: vi.fn(() => createMockRouter()),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => createMockSearchParams()),
    useParams: vi.fn(() => ({})),
    redirect: vi.fn((url: string, type?: 'replace' | 'push') => {
      // Mock redirect behavior - in real Next.js this throws to interrupt execution
      throw new Error(`NEXT_REDIRECT: ${url}`);
    }),
    notFound: vi.fn(() => {
      // Mock notFound behavior - in real Next.js this throws to interrupt execution
      throw new Error('NEXT_NOT_FOUND');
    }),
    permanentRedirect: vi.fn((url: string) => {
      // Mock permanent redirect behavior
      throw new Error(`NEXT_REDIRECT: ${url}`);
    }),
    useSelectedLayoutSegment: vi.fn(() => null),
    useSelectedLayoutSegments: vi.fn(() => []),
    useReportWebVitals: vi.fn((callback: (metric: any) => void) => {
      // Mock Web Vitals reporting
      setTimeout(() => {
        callback({
          id: 'mock-metric-id',
          name: 'CLS',
          value: 0.1,
          delta: 0.1,
          rating: 'good',
          entries: [],
        });
      }, 100);
    }),
  };
});

// Mock useLinkStatus hook
export const mockUseLinkStatus = vi.fn((href: string) => ({
  isLoading: false,
  isReady: true,
  isPending: false,
  error: null,
}));

// Mock link status context
export const mockLinkStatusContext = {
  registerLink: vi.fn((href: string) => {
    return {
      id: `link-${Math.random().toString(36).substring(2, 15)}`,
      href,
      status: 'idle',
    };
  }),

  updateLinkStatus: vi.fn((id: string, status: 'loading' | 'ready' | 'error') => {
    console.log(`Link ${id} status updated to: ${status}`);
  }),

  getLinkStatus: vi.fn((href: string) => ({
    isLoading: false,
    isReady: true,
    isPending: false,
    error: null,
  })),
};

// Mock layout segment utilities
export const mockLayoutSegmentUtils = {
  parseSegments: vi.fn((pathname: string) => {
    return pathname.split('/').filter(Boolean);
  }),

  getActiveSegment: vi.fn((segments: string[], level: number = 0) => {
    return segments[level] || null;
  }),

  getAllActiveSegments: vi.fn((pathname: string) => {
    return pathname.split('/').filter(Boolean);
  }),

  isSegmentActive: vi.fn((segment: string, pathname: string) => {
    return pathname.includes(segment);
  }),
};

// Mock navigation utilities
export const mockNavigationUtils = {
  createMockNavigationState: () => ({
    pathname: '/',
    search: '',
    hash: '',
    key: 'default',
    state: {},
  }),

  simulateNavigation: vi.fn((href: string, method: 'push' | 'replace' = 'push') => {
    const mockState = mockNavigationUtils.createMockNavigationState();
    mockState.pathname = href;

    if (typeof window !== 'undefined') {
      if (method === 'push') {
        window.history.pushState(mockState, '', href);
      } else {
        window.history.replaceState(mockState, '', href);
      }
    }

    return mockState;
  }),

  simulateBackNavigation: vi.fn(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }),

  simulateForwardNavigation: vi.fn(() => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }),
};

// Mock prefetch utilities
export const mockPrefetchUtils = {
  simulatePrefetch: vi.fn((href: string, options?: any) => {
    return Promise.resolve({
      href,
      prefetched: true,
      timestamp: Date.now(),
      options,
    });
  }),

  getPrefetchStatus: vi.fn((href: string) => ({
    href,
    isPrefetched: false,
    isLoading: false,
    error: null,
  })),

  clearPrefetchCache: vi.fn(() => {
    console.log('Prefetch cache cleared');
  }),
};

// Mock Web Vitals utilities
export const mockWebVitalsUtils = {
  createMockMetric: (name: string, value: number) => ({
    id: `mock-${name}-${Math.random().toString(36).substring(2, 15)}`,
    name,
    value,
    delta: value,
    rating: value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor',
    entries: [],
    navigationType: 'navigate',
  }),

  simulateWebVitals: vi.fn((callback: (metric: any) => void) => {
    const metrics = [
      mockWebVitalsUtils.createMockMetric('CLS', 0.1),
      mockWebVitalsUtils.createMockMetric('FID', 100),
      mockWebVitalsUtils.createMockMetric('FCP', 1800),
      mockWebVitalsUtils.createMockMetric('LCP', 2500),
      mockWebVitalsUtils.createMockMetric('TTFB', 800),
    ];

    metrics.forEach((metric, index) => {
      setTimeout(() => callback(metric), index * 100);
    });
  }),

  mockWebVitalsReporting: vi.fn((metrics: any[]) => {
    console.log('Web Vitals reported:', metrics);
  }),
};

// Mock navigation testing utilities
export const navigationTestUtils = {
  createMockRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),

  createMockSearchParams: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return {
      ...searchParams,
      get: vi.fn((key: string) => searchParams.get(key)),
      getAll: vi.fn((key: string) => searchParams.getAll(key)),
      has: vi.fn((key: string) => searchParams.has(key)),
      keys: vi.fn(() => searchParams.keys()),
      values: vi.fn(() => searchParams.values()),
      entries: vi.fn(() => searchParams.entries()),
      forEach: vi.fn((callback: (value: string, key: string, parent: URLSearchParams) => void) =>
        searchParams.forEach(callback),
      ),
      toString: vi.fn(() => searchParams.toString()),
    };
  },

  createMockParams: (params: Record<string, string | string[]> = {}) => params,

  expectNavigation: (mockRouter: any, method: 'push' | 'replace', expectedHref: string) => {
    expect(mockRouter[method]).toHaveBeenCalledWith(expectedHref, expect.any(Object));
  },

  expectRedirect: (redirectFn: any, expectedUrl: string) => {
    expect(() => redirectFn(expectedUrl)).toThrow(`NEXT_REDIRECT: ${expectedUrl}`);
  },

  expectNotFound: (notFoundFn: any) => {
    expect(() => notFoundFn()).toThrow('NEXT_NOT_FOUND');
  },

  expectPermanentRedirect: (permanentRedirectFn: any, expectedUrl: string) => {
    expect(() => permanentRedirectFn(expectedUrl)).toThrow(`NEXT_REDIRECT: ${expectedUrl}`);
  },

  expectLinkStatus: (linkStatusHook: any, href: string, expectedStatus: any) => {
    const status = linkStatusHook(href);
    expect(status).toStrictEqual(expect.objectContaining(expectedStatus));
  },

  expectWebVitalsReported: (reportWebVitalsHook: any) => {
    expect(reportWebVitalsHook).toHaveBeenCalledWith();
  },

  expectLayoutSegment: (useSelectedLayoutSegmentHook: any, expectedSegment: string | null) => {
    expect(useSelectedLayoutSegmentHook()).toBe(expectedSegment);
  },

  expectLayoutSegments: (useSelectedLayoutSegmentsHook: any, expectedSegments: string[]) => {
    expect(useSelectedLayoutSegmentsHook()).toStrictEqual(expectedSegments);
  },
};
