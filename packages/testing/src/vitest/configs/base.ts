import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { UserConfig } from 'vitest/config';

export interface BaseConfigOptions {
  aliases?: Record<string, string>;
  coverage?: boolean;
  environment?: 'jsdom' | 'node' | 'happy-dom';
  rootDir?: string;
  setupFiles?: string[];
}

export function createBaseConfig(options: BaseConfigOptions = {}): UserConfig {
  const {
    aliases = {},
    coverage = false,
    environment = 'jsdom',
    rootDir = process.cwd(),
    setupFiles = [],
  } = options;

  // Get current file URL and directory for proper path resolution
  const currentFileUrl = import.meta.url;
  const currentDir = dirname(fileURLToPath(currentFileUrl));
  const packagesDir = resolve(currentDir, '../../../packages');

  return {
    resolve: {
      alias: {
        '@': resolve(rootDir, './'),
        '@repo': packagesDir,
        ...aliases,
      },
    },
    test: {
      clearMocks: true,
      coverage: coverage
        ? {
            provider: 'v8',
            exclude: [
              'node_modules/',
              '**/*.config.*',
              '**/*.d.ts',
              '__tests__/helpers/**',
              '**/*.stories.*',
            ],
            reporter: ['text', 'json', 'html'],
          }
        : undefined,
      environment,
      globals: true,
      setupFiles,
    },
  };
}

export default createBaseConfig();
