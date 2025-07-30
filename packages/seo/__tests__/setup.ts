import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Import centralized mocks from @repo/qa (when available)
// TODO: Re-enable when @repo/qa exports are built
// import '@repo/qa/vitest/mocks/providers/nextjs';

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Mock Next.js modules completely
vi.mock('next', () => ({
  Metadata: {},
  Viewport: {},
  MetadataRoute: {},
  generateMetadata: vi.fn(),
  generateViewport: vi.fn(),
}));

// Mock server-only module
vi.mock('server-only', () => ({}));

// Mock lodash.merge for metadata merging
vi.mock('lodash.merge', () => ({
  default: vi.fn((target, source) => ({ ...target, ...source })),
}));

// Mock schema-dts for structured data
vi.mock('schema-dts', () => ({
  Thing: {},
  WithContext: {},
  Person: {},
  Organization: {},
  Product: {},
  Article: {},
  WebPage: {},
  WebSite: {},
  BreadcrumbList: {},
  Review: {},
  Rating: {},
  Offer: {},
  Brand: {},
  ImageObject: {},
  VideoObject: {},
  FAQ: {},
  HowTo: {},
  Recipe: {},
  Event: {},
  LocalBusiness: {},
}));

// Mock React for client components
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn(initial => [initial, vi.fn()]),
    useEffect: vi.fn(fn => fn()),
    useMemo: vi.fn(fn => fn()),
    useCallback: vi.fn(fn => fn),
    useContext: vi.fn(() => ({})),
    createContext: vi.fn(() => ({
      Provider: vi.fn(({ children }) => children),
      Consumer: vi.fn(),
    })),
  };
});

// Mock React DOM for server-side rendering
vi.mock('react-dom/server', () => ({
  renderToString: vi.fn(element => `<div>${element}</div>`),
  renderToStaticMarkup: vi.fn(element => `${element}`),
}));

// Mock environment setup
export const setupEnvironmentMocks = (
  env: 'development' | 'production' | 'test' = 'development',
) => {
  const originalEnv = process.env.NODE_ENV;
  const originalVars = {
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  };

  (process.env as any).NODE_ENV = env;
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.com';
  process.env.NEXT_PUBLIC_URL = 'https://test.com';
  process.env.NEXT_PUBLIC_SITE_NAME = 'Test Site';
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'A test site for SEO testing';

  return () => {
    (process.env as any).NODE_ENV = originalEnv;
    Object.entries(originalVars).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  };
};

// Mock browser environment for client-side testing
export const setupBrowserMocks = () => {
  Object.defineProperty(global, 'window', {
    value: {
      location: {
        href: 'https://example.com/test',
        pathname: '/test',
        search: '?param=value',
        hash: '#section',
        origin: 'https://example.com',
      },
      navigator: {
        userAgent: 'Mozilla/5.0 (Test Browser)',
        language: 'en-US',
        languages: ['en-US', 'en'],
      },
      document: {
        title: 'Test Page',
        createElement: vi.fn().mockReturnValue({
          setAttribute: vi.fn(),
          appendChild: vi.fn(),
          remove: vi.fn(),
        }),
        querySelector: vi.fn().mockReturnValue({
          content: 'test-content',
          setAttribute: vi.fn(),
        }),
        head: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      },
      history: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      },
    },
    writable: true,
  });

  Object.defineProperty(global, 'document', {
    value: global.window.document,
    writable: true,
  });
};

// Mock Node.js environment
export const setupNodeMocks = () => {
  delete (global as any).window;
  delete (global as any).document;
};

// Common SEO test configuration
export const createSEOTestConfig = (overrides: any = {}) => ({
  metadata: {
    siteName: 'Test Site',
    defaultTitle: 'Test Page',
    titleTemplate: '%s | Test Site',
    defaultDescription: 'A test page for SEO testing',
    defaultImage: 'https://example.com/default-image.jpg',
    defaultLocale: 'en-US',
    ...overrides.metadata,
  },
  openGraph: {
    type: 'website',
    siteName: 'Test Site',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Test Site Image',
      },
    ],
    ...overrides.openGraph,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@testsite',
    creator: '@testcreator',
    ...overrides.twitter,
  },
  structuredData: {
    organization: {
      name: 'Test Organization',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
    },
    website: {
      url: 'https://example.com',
      name: 'Test Site',
      description: 'A test website',
    },
    ...overrides.structuredData,
  },
  ...overrides,
});

// Common metadata creation patterns
export const createTestMetadata = async (config = {}) => {
  const { createMetadata } = await import('#/utils/metadata');
  return createMetadata({
    title: 'Test Page',
    description: 'Test page description',
    ...config,
  });
};

export const createTestStructuredData = async (type: string, data = {}) => {
  const module = await import('#/components/structured-data');
  const functionName = `create${type.charAt(0).toUpperCase() + type.slice(1)}Schema`;
  const createFunction = (module as any)[functionName];

  if (!createFunction) {
    throw new Error(`Unknown structured data type: ${type}`);
  }

  return createFunction(data);
};

// Export test factories and generators
export * from './seo-mocks';
export * from './seo-test-data';
export * from './seo-test-factory';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  setupBrowserMocks();
  setupEnvironmentMocks('development');
});
