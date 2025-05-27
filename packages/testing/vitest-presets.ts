import { resolve } from 'node:path';

import type { UserConfig } from 'vitest/config';

// Base configuration shared by all presets
const baseConfig: UserConfig['test'] = {
  clearMocks: true,
  coverage: {
    provider: 'v8',
    exclude: [
      'node_modules/',
      '**/*.config.*',
      '**/*.d.ts',
      '__tests__/**',
      '**/*.stories.tsx',
      '**/test-utils.tsx',
    ],
    reporter: ['text', 'json', 'html'],
  },
  globals: true,
  mockReset: true,
  restoreMocks: true,
};

// React component testing preset
export const reactPreset: UserConfig['test'] = {
  ...baseConfig,
  css: {
    modules: {
      classNameStrategy: 'non-scoped',
    },
  },
  environment: 'jsdom',
  setupFiles: [resolve(__dirname, './setup/react.ts')],
};

// Node.js testing preset
export const nodePreset: UserConfig['test'] = {
  ...baseConfig,
  environment: 'node',
  setupFiles: [resolve(__dirname, './setup/node.ts')],
};

// Next.js testing preset
export const nextPreset: UserConfig['test'] = {
  ...baseConfig,
  alias: {
    '@': resolve(process.cwd(), './'),
  },
  environment: 'jsdom',
  setupFiles: [resolve(__dirname, './setup/nextjs.ts')],
};

// Integration testing preset
export const integrationPreset: UserConfig['test'] = {
  ...baseConfig,
  environment: 'node',
  hookTimeout: 30000,
  setupFiles: [resolve(__dirname, './setup/integration.ts')],
  testTimeout: 30000,
};

// Helper to create custom preset
export function createPreset(overrides: Partial<UserConfig['test']> = {}): UserConfig['test'] {
  return {
    ...baseConfig,
    ...overrides,
  };
}
