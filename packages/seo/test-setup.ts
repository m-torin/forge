import { vi } from 'vitest';

// Mock server-only module for testing
vi.mock('server-only', () => ({}));

// Mock process.env for metadata generation
vi.stubGlobal('process', {
  ...process,
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
});
