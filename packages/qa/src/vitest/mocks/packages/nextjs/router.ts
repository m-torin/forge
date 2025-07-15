// Next.js Pages Router mocks
import { vi } from 'vitest';

// Next.js Router (for Pages Router)
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    reload: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    basePath: '',
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    isReady: true,
    isPreview: false,
    isFallback: false,
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  })),
  withRouter: vi.fn((Component: any) => Component),
}));
