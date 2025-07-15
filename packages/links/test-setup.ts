// Environment setup for links tests
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_NODE_ENV', 'test');

// Mock Dub.sh configuration
vi.stubEnv('DUB_ENABLED', 'false');
vi.stubEnv('DUB_API_KEY', 'test-dub-api-key');
vi.stubEnv('DUB_WORKSPACE', 'test-workspace');
vi.stubEnv('DUB_DEFAULT_DOMAIN', 'dub.sh');
vi.stubEnv('DUB_BASE_URL', 'https://api.dub.co');

// Mock analytics configuration
vi.stubEnv('POSTHOG_API_KEY', 'test-posthog-key');
vi.stubEnv('SEGMENT_WRITE_KEY', 'test-segment-key');
vi.stubEnv('LINKS_ANALYTICS_ENABLED', 'false');
vi.stubEnv('LINKS_ANALYTICS_SAMPLING', '1.0');

// Mock public keys
vi.stubEnv('NEXT_PUBLIC_DUB_API_KEY', 'test-public-dub-api-key');
vi.stubEnv('NEXT_PUBLIC_DUB_WORKSPACE', 'test-public-workspace');
vi.stubEnv('NEXT_PUBLIC_POSTHOG_API_KEY', 'test-public-posthog-key');
