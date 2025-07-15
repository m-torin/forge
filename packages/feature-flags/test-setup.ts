// Environment setup for feature-flags tests using modern Vitest practices
import { vi } from 'vitest';

// Use vi.stubEnv for environment variables (modern Vitest approach)
vi.stubEnv('NODE_ENV', 'test');

// PostHog configuration
vi.stubEnv('POSTHOG_KEY', 'test-posthog-key');
vi.stubEnv('POSTHOG_HOST', 'https://app.posthog.com');
vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'test-personal-key');
vi.stubEnv('POSTHOG_PROJECT_ID', 'test-project-id');

// Edge Config
vi.stubEnv('EDGE_CONFIG', 'https://edge-config.vercel.com/test-edge-config');

// Public PostHog configuration
vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test-public-posthog-key');
vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://app.posthog.com');
vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'development');

// Mock navigator object for testing-library/user-event
Object.defineProperty(globalThis, 'navigator', {
  value: {
    userAgent: 'test-user-agent',
    clipboard: {
      readText: vi.fn(),
      writeText: vi.fn(),
    },
  },
  writable: true,
});

// Mock window.navigator as well
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'test-user-agent',
      clipboard: {
        readText: vi.fn(),
        writeText: vi.fn(),
      },
    },
    writable: true,
  });
}
