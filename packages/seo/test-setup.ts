import { vi } from 'vitest';

// Mock process.env for metadata generation
vi.stubGlobal('process', {
  ...process,
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
});
