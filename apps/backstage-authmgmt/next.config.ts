// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config } = configModule;

async function buildConfig() {
  const nextConfig = {
    ...config,
    basePath: '/authmgmt',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/authmgmt' : undefined,
  };

  return nextConfig;
}

export default buildConfig();