import react from '@vitejs/plugin-react';
import { type UserConfig } from 'vitest/config';

import { type BaseConfigOptions, createBaseConfig } from './base-config';

export interface ReactConfigOptions extends BaseConfigOptions {
  reactOptions?: Parameters<typeof react>[0];
}

export function createReactConfig(options: ReactConfigOptions = {}): UserConfig {
  const { reactOptions, ...baseOptions } = options;
  const config = createBaseConfig({
    environment: 'jsdom',
    ...baseOptions,
  });

  return {
    ...config,
    plugins: [...(config.plugins || []), react(reactOptions)],
  };
}
