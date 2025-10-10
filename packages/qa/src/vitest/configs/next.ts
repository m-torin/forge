import { existsSync } from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { type UserConfig } from 'vitest/config';

import { type BaseConfigOptions, createBaseConfig } from './base-config';

export interface NextConfigOptions extends BaseConfigOptions {
  includeAppDir?: boolean;
  reactOptions?: Parameters<typeof react>[0];
}

export function createNextConfig(options: NextConfigOptions = {}): UserConfig {
  const { includeAppDir = true, reactOptions, ...baseOptions } = options;

  // Default setup file for Next.js environment
  const setupFiles = baseOptions.setupFiles || [];
  const defaultNextSetupPath = path.resolve(process.cwd(), './setup.ts');

  // Check if the setup file exists before adding it
  if (existsSync(defaultNextSetupPath)) {
    setupFiles.push(defaultNextSetupPath);
  }

  const config = createBaseConfig({
    environment: 'jsdom',
    setupFiles,
    ...baseOptions,
  });

  // Add Next.js-specific aliases
  const aliases = {
    ...(config.resolve?.alias || {}),
    // Add app directory if requested
    ...(includeAppDir ? { '#/app': path.resolve(process.cwd(), './app') } : {}),
    '#/components': path.resolve(process.cwd(), './components'),
    '#/lib': path.resolve(process.cwd(), './lib'),
  };

  return {
    ...config,
    plugins: [...(config.plugins || []), react(reactOptions)],
    resolve: {
      ...config.resolve,
      alias: aliases,
    },
  };
}
