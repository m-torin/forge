import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Setup test environment manually instead of using @repo/qa import due to resolution issues
(process.env as any).NODE_ENV = 'test';
process.env.CI = 'true';
process.env.SKIP_ENV_VALIDATION = 'true';

// SEO package specific environment
process.env.NEXT_PUBLIC_SITE_URL = 'https://test.example.com';
process.env.METADATA_CACHE_TTL = '3600';

// Mock process.env for metadata generation (preserve existing functionality)
vi.stubGlobal('process', {
  ...process,
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
});
