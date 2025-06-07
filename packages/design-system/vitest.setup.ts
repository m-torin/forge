import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock geist font imports
vi.mock('geist', () => ({
  GeistSans: {
    style: {
      fontFamily: 'GeistSans, sans-serif',
    },
  },
  GeistMono: {
    style: {
      fontFamily: 'GeistMono, monospace',
    },
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    setTheme: vi.fn(),
    systemTheme: 'light',
    theme: 'light',
    resolvedTheme: 'light',
    themes: ['light', 'dark', 'system'],
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
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

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

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

// Mock notifications package
vi.mock('@repo/notifications/mantine-notifications', () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    custom: vi.fn(),
  },
}));

// Mock analytics package
vi.mock('@repo/analytics', () => ({
  track: vi.fn(),
  identify: vi.fn(),
  useFlag: vi.fn(() => false),
  flag: vi.fn(() => false),
}));

// Mock CSS imports to prevent PostCSS issues
vi.mock('*.css', () => ({}));
vi.mock('./styles/index.css', () => ({}));
