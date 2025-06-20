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
    vi.spyOn(Element.prototype, 'hasPointerCapture').mockImplementation(() => false);
  }

  if (!Element.prototype.setPointerCapture) {
    vi.spyOn(Element.prototype, 'setPointerCapture').mockImplementation(() => {});
  }

  if (!Element.prototype.releasePointerCapture) {
    vi.spyOn(Element.prototype, 'releasePointerCapture').mockImplementation(() => {});
  }

  // Mock scrollIntoView
  if (!Element.prototype.scrollIntoView) {
    vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {});
  }
}

export default setupBrowserMocks;
