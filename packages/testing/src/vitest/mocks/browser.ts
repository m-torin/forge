import { vi } from 'vitest';

export function setupBrowserMocks(): void {
  // Mock IntersectionObserver for testing environments
  global.IntersectionObserver = class IntersectionObserver {
    observe() {} // Intentionally empty for testing
    unobserve() {} // Intentionally empty for testing
    disconnect() {} // Intentionally empty for testing
  } as any;

  // Mock ResizeObserver for testing environments
  global.ResizeObserver = class ResizeObserver {
    observe() {} // Intentionally empty for testing
    unobserve() {} // Intentionally empty for testing
    disconnect() {} // Intentionally empty for testing
  } as any;

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation((query) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    writable: true,
  });

  // Mock pointer events
  if (!Element.prototype.hasPointerCapture) {
    Object.defineProperty(Element.prototype, 'hasPointerCapture', {
      value: vi.fn(() => false),
      writable: true,
    });
  }

  if (!Element.prototype.setPointerCapture) {
    Object.defineProperty(Element.prototype, 'setPointerCapture', {
      value: vi.fn(),
      writable: true,
    });
  }

  if (!Element.prototype.releasePointerCapture) {
    Object.defineProperty(Element.prototype, 'releasePointerCapture', {
      value: vi.fn(),
      writable: true,
    });
  }

  // Mock scrollIntoView
  if (!Element.prototype.scrollIntoView) {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      value: vi.fn(),
      writable: true,
    });
  }
}

export default setupBrowserMocks;
