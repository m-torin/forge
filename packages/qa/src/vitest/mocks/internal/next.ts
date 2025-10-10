import { vi } from 'vitest';

// Define ReactNode type locally to avoid import errors
type ReactNode = any;

// Router mock functions that can be used across tests
const mockRouterPush = vi.fn();
const mockRouterReplace = vi.fn();
const mockRouterBack = vi.fn();
const mockRouterForward = vi.fn();
const mockRouterRefresh = vi.fn();
const mockRouterPrefetch = vi.fn();

// Helper to reset all router mocks
const resetRouterMocks = () => {
  mockRouterPush.mockClear();
  mockRouterReplace.mockClear();
  mockRouterBack.mockClear();
  mockRouterForward.mockClear();
  mockRouterRefresh.mockClear();
  mockRouterPrefetch.mockClear();
};

function mockNextNavigation(): void {
  vi.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({
      pathname: '/',
      back: mockRouterBack,
      forward: mockRouterForward,
      prefetch: mockRouterPrefetch,
      push: mockRouterPush,
      refresh: mockRouterRefresh,
      replace: mockRouterReplace,
    }),
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
    permanentRedirect: vi.fn(),
  }));
}

// Next.js server-side mocks
const mockNextRequest = vi.fn();
const mockNextResponse = vi.fn(() => ({
  json: vi.fn(),
  status: vi.fn(),
  headers: new Map(),
}));

// Headers and cookies mocks
const mockHeaders = vi.fn(() => new Map());
const mockCookies = vi.fn(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
  getAll: vi.fn(),
}));

function mockNextServer(): void {
  vi.mock('next/server', () => ({
    NextRequest: mockNextRequest,
    NextResponse: mockNextResponse,
  }));
}

function mockNextHeaders(): void {
  vi.mock('next/headers', () => ({
    headers: mockHeaders,
    cookies: mockCookies,
  }));
}

function mockNextThemes(): void {
  vi.mock('next-themes', () => ({
    ThemeProvider: ({ children }: { children: ReactNode }) => children,
    useTheme: () => ({
      setTheme: vi.fn(),
      systemTheme: 'light',
      theme: 'light',
      themes: ['light', 'dark', 'system'],
    }),
  }));
}

function mockNextImage(): void {
  vi.mock('next/image', () => ({
    default: (props: any) => {
      const { alt, src, 'data-testid': testId, ...rest } = props;
      return {
        type: 'img',
        props: {
          alt,
          src,
          ...rest,
          'data-testid': testId || 'next-image',
        },
      };
    },
  }));
}

function mockNextLink(): void {
  vi.mock('next/link', () => ({
    default: ({
      children,
      href,
      'data-testid': testId,
      ...props
    }: {
      children: ReactNode;
      href: string;
      'data-testid'?: string;
      [key: string]: any;
    }) => ({
      type: 'a',
      props: {
        href,
        ...props,
        'data-testid': testId || 'next-link',
        children,
      },
    }),
  }));
}

function mockNextFonts(): void {
  vi.mock('next/font/google', () => ({
    Inter: () => ({
      style: { fontFamily: 'Inter' },
      className: 'inter-font',
    }),
    Roboto: () => ({
      style: { fontFamily: 'Roboto' },
      className: 'roboto-font',
    }),
    Poppins: () => ({
      style: { fontFamily: 'Poppins' },
      className: 'poppins-font',
    }),
  }));

  vi.mock('next/font/local', () => ({
    default: () => ({
      style: { fontFamily: 'Local Font' },
      className: 'local-font',
    }),
  }));
}

// mockNextHeaders function already defined above

function setupNextMocks(): void {
  mockNextNavigation();
  mockNextThemes();
  mockNextImage();
  mockNextLink();
  mockNextFonts();
  mockNextHeaders();
}

// Automatically setup Next.js mocks when this module is imported
setupNextMocks();
