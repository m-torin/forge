import { vi } from 'vitest';

export function setupBrowserMocks(): void {
  // Only setup browser mocks if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Mock IntersectionObserver for testing environments
  if (!global.IntersectionObserver) {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: () => [],
    }));
    global.IntersectionObserver = mockIntersectionObserver as any;
    (window as any).IntersectionObserver = mockIntersectionObserver;
  }

  // Mock ResizeObserver for testing environments
  if (!global.ResizeObserver) {
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    global.ResizeObserver = mockResizeObserver as any;
    (window as any).ResizeObserver = mockResizeObserver;
  }

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => '',
    }),
  });

  // Mock scrollTo
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
  });

  // Mock scrollBy
  Object.defineProperty(window, 'scrollBy', {
    value: vi.fn(),
  });

  // Mock element methods
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn() as any;
  }
  // Always mock scrollIntoView to ensure it's available
  try {
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  } catch (error) {
    // If spying fails, ensure the method exists
    Element.prototype.scrollIntoView = vi.fn() as any;
  }

  if (!Element.prototype.getBoundingClientRect) {
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    })) as any;
  }

  // Mock navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Node.js Test Environment)',
      language: 'en-US',
      languages: ['en-US', 'en'],
      onLine: true,
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(''),
      },
    },
    writable: true,
    configurable: true,
  });

  // Mock Web Animations API
  if (!Element.prototype.animate) {
    Element.prototype.animate = vi.fn().mockReturnValue({
      play: vi.fn(),
      pause: vi.fn(),
      finish: vi.fn(),
      cancel: vi.fn(),
      onfinish: null,
      oncancel: null,
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      effect: null,
      timeline: null,
      playState: 'idle',
      playbackRate: 1,
      startTime: null,
      currentTime: null,
      pending: false,
      id: '',
      remove: vi.fn(),
      updatePlaybackRate: vi.fn(),
      reverse: vi.fn(),
      persist: vi.fn(),
      commitStyles: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }) as any;
  }

  // Mock URL methods if they don't exist
  if (window.URL) {
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url') as any;
    }
    // Always mock createObjectURL to ensure it's available
    try {
      vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'blob:mock-url');
    } catch (error) {
      // If spying fails, ensure the method exists
      window.URL.createObjectURL = vi.fn(() => 'blob:mock-url') as any;
    }

    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn() as any;
    }
    // Always mock revokeObjectURL to ensure it's available
    try {
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
    } catch (error) {
      // If spying fails, ensure the method exists
      window.URL.revokeObjectURL = vi.fn() as any;
    }
  }

  // Mock requestAnimationFrame
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = vi.fn(cb => {
      setTimeout(cb, 0);
      return 0;
    }) as any;
  }

  if (!global.cancelAnimationFrame) {
    global.cancelAnimationFrame = vi.fn() as any;
  }

  // Mock fetch if not already defined
  if (!global.fetch) {
    global.fetch = vi.fn() as any;
  }
}

// Only auto-setup if in jsdom environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  setupBrowserMocks();
}

export default setupBrowserMocks;
