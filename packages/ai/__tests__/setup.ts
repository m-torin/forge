// Environment setup for AI tests
import { afterAll, beforeAll, vi } from 'vitest';

// Import centralized mocks from @repo/qa package
import '@repo/qa/vitest/mocks';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_NODE_ENV', 'test');

// Mock API Keys for AI providers
vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test-ai-package-key');
vi.stubEnv('OPENAI_API_KEY', 'sk-test-ai-package-key');
vi.stubEnv('GOOGLE_AI_API_KEY', 'test-google-ai-key');
vi.stubEnv('DEEP_INFRA_API_KEY', 'test-deep-infra-key');
vi.stubEnv('PERPLEXITY_API_KEY', 'test-perplexity-key');

// Mock Upstash Vector Database
vi.stubEnv('UPSTASH_VECTOR_REST_URL', 'https://test-vector.upstash.io');
vi.stubEnv('UPSTASH_VECTOR_REST_TOKEN', 'test-vector-token');
vi.stubEnv('UPSTASH_VECTOR_NAMESPACE', 'test-namespace');

// Mock MCP Configuration
vi.stubEnv('MCP_SERVERS', 'test-servers');
vi.stubEnv('MCP_FILESYSTEM_PATH', '/test/path');
vi.stubEnv('MCP_SQLITE_DB', 'test.db');

// Mock AI Logging Configuration
vi.stubEnv('AI_LOGGING_ENABLED', 'false');
vi.stubEnv('AI_LOG_REQUESTS', 'false');
vi.stubEnv('AI_LOG_RESPONSES', 'false');
vi.stubEnv('AI_LOG_PERFORMANCE', 'false');

// Mock public feature flags
vi.stubEnv('NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED', 'false');
vi.stubEnv('NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED', 'false');

// Additional AI-specific test configuration
vi.stubEnv('AI_MOCK_RESPONSES', 'true');
vi.stubEnv('DISABLE_AI_RATE_LIMITING', 'true');
vi.stubEnv('USE_MOCK_AI_RESPONSES', 'true');
vi.stubEnv('AI_REQUEST_TIMEOUT', '5000');

// Only import jest-dom in browser environments
if (typeof window !== 'undefined') {
  import('@testing-library/jest-dom');
}

// Mock window.matchMedia if window exists
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver if it exists
if (typeof IntersectionObserver !== 'undefined') {
  vi.spyOn(global, 'IntersectionObserver').mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }));
}

// Mock ResizeObserver if it exists
if (typeof ResizeObserver !== 'undefined') {
  vi.spyOn(global, 'ResizeObserver').mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
}

// Suppress React warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

// Additional AI-specific test configuration
// These are handled by vi.stubEnv above already
