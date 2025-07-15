// Next.js specific test setup
// Import this in your vitest.setup.ts file for Next.js apps

import { beforeEach, vi } from 'vitest';
import { setupTestEnvironment } from '../utils/environment';
import './common';

// Clear all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Setup Next.js environment variables
setupTestEnvironment(
  {
    NEXT_PUBLIC_VERCEL_URL: 'http://localhost:3000',
  },
  'nextjs',
);

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    isReady: true,
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, ...props }: any) => {
    // Return a mock element representation
    return {
      type: 'img',
      props: { src, alt, ...props },
    };
  }),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: vi.fn(({ children, href, ...props }: any) => {
    // Return a mock element representation
    return {
      type: 'a',
      props: { href, ...props },
      children,
    };
  }),
}));

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => ({
  default: (loader: any) => {
    const Component = loader();
    return Component;
  },
}));

// Browser mocks (including fetch and matchMedia) are handled by browser.ts
// which is imported via ../mocks in next-app.ts
