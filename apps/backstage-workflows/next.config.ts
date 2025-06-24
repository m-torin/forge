// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config } = configModule;

async function buildConfig() {
  const nextConfig = {
    ...config,
    basePath: '/workflows',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/workflows' : undefined,
  };

  return nextConfig;
}

export default buildConfig();