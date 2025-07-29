// Next.js Mocks - Main Export File
// This file imports all Next.js mocks to ensure they are registered with Vitest

import { vi } from 'vitest';

// Import all mock files to register the vi.mock calls
import './cache';
import './components';
import './dynamic';
import './errors';
import './fonts';
import './headers';
import './metadata';
import './navigation';
import './router';
import './server';
import './server-actions';
import './testing';

// Re-export utilities that might be useful for tests
export { mockErrorComponent, mockGlobalError } from './errors';
export { createMockCookies, createMockHeaders, createMockSearchParams, React } from './shared';

// Re-export server action utilities
export {
  mockServerActionDebug,
  mockServerActionError,
  mockServerActionPerformance,
  mockServerActionSecurity,
  serverActionTestUtils,
} from './server-actions';

// Re-export metadata utilities
export {
  metadataTestUtils,
  mockMetadataCache,
  mockMetadataRoutes,
  mockMetadataTransformation,
  mockMetadataTypes,
  mockMetadataUtils,
  mockMetadataValidation,
} from './metadata';

// Re-export testing utilities
export {
  mockDoesMiddlewareMatch,
  mockGetRedirectUrl,
  mockGetResponseFromNextConfig,
  mockGetRewrittenUrl,
  mockIsRedirect,
  mockIsRewrite,
  testingUtils,
} from './testing';

// Re-export navigation utilities
export {
  mockLayoutSegmentUtils,
  mockLinkStatusContext,
  mockNavigationUtils,
  mockPrefetchUtils,
  mockUseLinkStatus,
  mockWebVitalsUtils,
  navigationTestUtils,
} from './navigation';

// Re-export component utilities
export {
  componentTestUtils,
  mockDynamicUtils,
  mockFormUtils,
  mockImageOptimization,
  mockLinkPrefetch,
  mockLinkStatus,
  mockScriptUtils,
} from './components';

// Re-export server utilities
export {
  mockAfter,
  mockConnection,
  mockForbidden,
  mockServerContext,
  mockServerPerformance,
  mockServerSecurity,
  mockServerUtils,
  mockUnauthorized,
  serverTestUtils,
} from './server';

// Re-export dynamic utilities
export { dynamicTestUtils, mockDynamicImport, mockDynamicLoading } from './dynamic';

// Export type definitions for better TypeScript support
export type MockNextRouter = {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  reload: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
  pathname: string;
  route: string;
  query: Record<string, string | string[]>;
  asPath: string;
  basePath: string;
  locale: string;
  locales: string[];
  defaultLocale: string;
  isReady: boolean;
  isPreview: boolean;
  isFallback: boolean;
  events: {
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
  };
};

export type MockAppRouter = {
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

export type MockHeaders = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  append: ReturnType<typeof vi.fn>;
  forEach: ReturnType<typeof vi.fn>;
  keys: ReturnType<typeof vi.fn>;
  values: ReturnType<typeof vi.fn>;
  entries: ReturnType<typeof vi.fn>;
  [Symbol.iterator]: ReturnType<typeof vi.fn>;
};

export type MockCookies = {
  get: ReturnType<typeof vi.fn>;
  getAll: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  has: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  size: number;
  toString: ReturnType<typeof vi.fn>;
};
