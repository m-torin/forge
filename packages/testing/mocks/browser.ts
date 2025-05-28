import { vi } from 'vitest';

export function setupBrowserMocks(): void {
  // Mock IntersectionObserver for testing environments
  global.IntersectionObserver = class IntersectionObserver {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe() {} // Intentionally empty for testing
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {} // Intentionally empty for testing
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect() {} // Intentionally empty for testing
  } as any;

  // Mock ResizeObserver for testing environments
  global.ResizeObserver = class ResizeObserver {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe() {} // Intentionally empty for testing
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve() {} // Intentionally empty for testing
    // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  }

  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }

  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }

  // Mock scrollIntoView
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
}

export default setupBrowserMocks;
