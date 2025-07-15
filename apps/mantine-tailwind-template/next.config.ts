import { config, mergeConfig } from '@repo/config/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = mergeConfig(config, {
  // App-specific configurations can be added here
  // The base config already includes OpenTelemetry warning suppression,
  // Prisma plugin, bundle optimization, and other monorepo optimizations
});

export default nextConfig;
