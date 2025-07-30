import { logWarn } from '@repo/observability';
import type { NextConfig } from 'next';

/**
 * Next.js configuration with security headers and Vercel Toolbar integration
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp'],
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://vercel.live",
              "img-src 'self' data: blob: https://vercel.live https://vercel.com https://avatar.vercel.sh",
              "font-src 'self' https://vercel.live https://assets.vercel.com",
              "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com",
              "frame-src 'self' https://vercel.live",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

/**
 * Try to load Vercel Toolbar, fallback to base config if not available
 */
let config = nextConfig;

try {
  const { createRequire } = require('module');
  const requireFn = createRequire(import.meta.url);
  const { default: withVercelToolbar } = requireFn('@vercel/toolbar/plugins/next');

  if (typeof withVercelToolbar === 'function') {
    config = withVercelToolbar()(nextConfig);
  }
} catch (error: any) {
  logWarn('Vercel Toolbar not available, using base config', {
    error: error?.message || 'Unknown error',
    configType: 'next.config.ts',
  });
}

export default config;
