// @ts-ignore - Next.js transpilation issue with workspace imports
const configModule = require('../../packages/config/src/next/index.ts');
const { config, mergeConfig } = configModule;

async function buildConfig() {
  const nextConfig = mergeConfig(config, {
    // Disable type checking and linting during build
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  });

  return nextConfig;
}

export default buildConfig();
