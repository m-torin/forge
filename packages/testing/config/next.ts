import path from 'node:path';

import react from '@vitejs/plugin-react';
import { type UserConfig } from 'vitest/config';

import { type BaseConfigOptions, createBaseConfig } from './base';

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
  try {
    // This would work in a Node.js environment, but might need adjustment for ESM
    if (require.resolve(defaultNextSetupPath)) {
      setupFiles.push(defaultNextSetupPath);
    }
  } catch {
    // If the file doesn't exist, we just don't add it
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
    ...(includeAppDir ? { '@/app': path.resolve(process.cwd(), './app') } : {}),
    '@/components': path.resolve(process.cwd(), './components'),
    '@/lib': path.resolve(process.cwd(), './lib'),
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

export default createNextConfig;
