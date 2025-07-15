// Environment setup for feature-flags tests
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');

// Mock PostHog configuration
vi.stubEnv('POSTHOG_KEY', 'test-posthog-key');
vi.stubEnv('POSTHOG_HOST', 'https://app.posthog.com');
vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'test-personal-api-key');
vi.stubEnv('POSTHOG_PROJECT_ID', 'test-project-id');

// Mock Edge Config
vi.stubEnv('EDGE_CONFIG', 'https://edge-config.vercel.com/test');

// Mock public PostHog configuration
vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'test-public-posthog-key');
vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://app.posthog.com');
vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'development');
