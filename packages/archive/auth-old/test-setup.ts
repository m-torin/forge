import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock browser APIs
global.fetch = vi.fn();

// Mock environment variables to avoid env validation errors
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test_key';
process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://test.posthog.com';
process.env.BETTER_AUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock server-only module to avoid the client component error
vi.mock('server-only', () => {
  return {
    // Empty mock
  };
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    back: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));
