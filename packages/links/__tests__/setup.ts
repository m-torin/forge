import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Observability mocks are now provided automatically by centralized @repo/qa setup

vi.mock('@repo/analytics/shared', () => ({
  createAnalytics: vi.fn(() => ({
    identify: vi.fn(),
    track: vi.fn(),
    page: vi.fn(),
    group: vi.fn(),
    reset: vi.fn(),
    enabled: true,
  })),
  createAnalyticsIntegration: vi.fn(() => ({
    identify: vi.fn(),
    track: vi.fn(),
    enabled: true,
    filterEvents: vi.fn(events => events),
    isEnabled: vi.fn(() => true),
  })),
}));

// Mock Dub client
vi.mock('dub', () => ({
  Dub: vi.fn().mockImplementation(() => ({
    links: {
      create: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getClicks: vi.fn(),
      createMany: vi.fn(),
    },
    analytics: {
      retrieve: vi.fn(),
    },
    domains: {
      list: vi.fn(),
    },
  })),
  default: vi.fn(),
}));

// Mock DubProvider to ensure it has the client property and all methods
vi.mock('../src/shared/providers/dub-provider', async () => {
  const actual = await vi.importActual('../src/shared/providers/dub-provider');

  class MockDubProvider {
    name = 'dub';
    client: any;
    config: any;

    constructor(config: any, client?: any) {
      this.config = config;
      this.client = client || {
        links: {
          create: vi.fn().mockImplementation(data =>
            Promise.resolve({
              id: 'test-link-id',
              url: data?.url || 'https://example.com',
              shortUrl: 'https://dub.sh/test',
              domain: data?.domain || 'dub.sh',
              key: data?.key || 'test',
              title: data?.title,
              description: data?.description,
              tags: data?.tags,
              clicks: 0,
              uniqueClicks: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          ),
          get: vi.fn().mockImplementation(id =>
            Promise.resolve({
              id: id || 'test-link-id',
              url: 'https://example.com',
              shortUrl: 'https://dub.sh/test',
              domain: 'dub.sh',
              key: 'test',
              title: 'Test Link',
              description: 'A test link',
              tags: ['test'],
              clicks: 0,
              uniqueClicks: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          ),
          update: vi.fn().mockImplementation((id, data) =>
            Promise.resolve({
              id: id || 'test-link-id',
              url: data?.url || 'https://example.com',
              shortUrl: 'https://dub.sh/test',
              domain: data?.domain || 'dub.sh',
              key: data?.key || 'test',
              title: data?.title !== undefined ? data.title : 'Updated Test Link',
              description:
                data?.description !== undefined ? data.description : 'An updated test link',
              tags: data?.tags !== undefined ? data.tags : ['test'],
              clicks: 0,
              uniqueClicks: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          ),
          delete: vi.fn().mockResolvedValue(undefined),
          getClicks: vi.fn().mockResolvedValue([
            {
              timestamp: new Date().toISOString(),
              country: 'US',
              browser: 'Chrome',
              device: 'Desktop',
              referrer: 'google.com',
            },
          ]),
          createMany: vi.fn().mockImplementation(data =>
            Promise.resolve({
              created:
                data?.links?.map((link: any, index: number) => ({
                  id: `bulk-link-${index + 1}`,
                  url: link.url || `https://example.com/${index + 1}`,
                  shortUrl: `https://dub.sh/bulk${index + 1}`,
                  domain: link.domain || 'dub.sh',
                  key: link.key || `bulk${index + 1}`,
                  title: link.title,
                  description: link.description,
                  tags: link.tags,
                  clicks: 0,
                  uniqueClicks: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })) || [],
              failed: [],
            }),
          ),
        },
        analytics: {
          retrieve: vi.fn().mockImplementation(
            (
              _id,
              period, // eslint-disable-line unused-imports/no-unused-vars
            ) =>
              Promise.resolve({
                clicks: 100,
                uniqueClicks: 85,
                topCountries: [{ country: 'US', clicks: 50 }],
                topReferrers: [{ referrer: 'google.com', clicks: 60 }],
                topBrowsers: [{ browser: 'Chrome', clicks: 70 }],
              }),
          ),
        },
        domains: { list: vi.fn().mockResolvedValue([]) },
      };
    }

    createLink = vi.fn().mockImplementation(data => {
      return this.client.links.create(data);
    });

    getLink = vi.fn().mockImplementation(async id => {
      try {
        return await this.client.links.get(id);
      } catch (error: any) {
        if (error.message?.includes('404')) {
          return null;
        }
        throw error;
      }
    });

    updateLink = vi.fn().mockImplementation((id, data) => {
      return this.client.links.update(id, data);
    });

    deleteLink = vi.fn().mockImplementation(id => {
      return this.client.links.delete(id);
    });

    getAnalytics = vi.fn().mockImplementation((id, period) => {
      return this.client.analytics.retrieve(id, period);
    });

    getClicks = vi.fn().mockImplementation(id => {
      return this.client.links.getClicks(id);
    });

    bulkCreate = vi.fn().mockImplementation(async data => {
      const result = await this.client.links.createMany(data);
      // Ensure we return the correct bulk response format
      return result;
    });
  }

  return {
    ...actual,
    DubProvider: MockDubProvider,
  };
});

// Mock React hooks for client-side components
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useCallback: vi.fn(fn => fn),
    useEffect: vi.fn(fn => fn()),
    useMemo: vi.fn(fn => fn()),
    useRef: vi.fn(() => ({ current: null })),
    useState: vi.fn(initial => [initial, vi.fn()]),
    useContext: vi.fn(() => ({})),
  };
});

// Mock browser environment
export const setupBrowserMocks = () => {
  vi.stubGlobal('window', {
    open: vi.fn(),
    location: { href: 'https://example.com' },
    navigator: { userAgent: 'Mozilla/5.0 (Test Browser)' },
  });
  vi.stubGlobal('document', {
    createElement: vi.fn(),
    referrer: 'https://google.com',
  });
};

// Mock Node.js environment
export const setupNodeMocks = () => {
  vi.unstubAllGlobals();
};

// Common link test configuration
export const createLinkTestConfig = (overrides = {}) => ({
  providers: {
    dub: {
      enabled: true,
      apiKey: 'test-api-key',
      ...overrides.dub,
    },
    ...overrides.providers,
  },
  analytics: {
    enabled: true,
    events: ['link_created', 'link_clicked', 'link_updated', 'link_deleted'],
    sampling: 1.0,
    ...overrides.analytics,
  },
  ...overrides,
});

// Common link manager creation patterns
export const createTestLinkManager = async (config = createLinkTestConfig()) => {
  const { createLinkManager } = await import('../src/shared/utils/link-manager');
  return createLinkManager(config);
};

export const createTestDubProvider = async (config = { enabled: true, apiKey: 'test-key' }) => {
  const { DubProvider } = await import('../src/shared/providers/dub-provider');
  const { createTestData } = await import('./link-test-factory');
  const provider = new DubProvider(config);
  // Add mock properties for tests
  provider.client = createTestData.dubClient();
  provider.name = 'dub';
  return provider;
};

export const createTestAnalyticsIntegration = async (config = { enabled: true }) => {
  const { createAnalyticsIntegration } = await import('../src/shared/utils/analytics-integration');
  return createAnalyticsIntegration(config);
};

// Export test factories and generators
export * from './link-test-factory';
export * from './test-data-generators';

// Common link manager creation patterns
export { createTestData } from './link-test-factory';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  setupBrowserMocks();
});
