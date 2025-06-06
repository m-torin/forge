import { type UserConfig } from 'vitest/config';

import { type BaseConfigOptions, createBaseConfig } from './base';

export function createNodeConfig(options: BaseConfigOptions = {}): UserConfig {
  return createBaseConfig({
    environment: 'node',
    ...options,
  });
}

export default createNodeConfig();
