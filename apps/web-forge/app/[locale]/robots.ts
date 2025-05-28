import { env } from '@/env';

import type { MetadataRoute } from 'next';

const productionUrl = env.VERCEL_PROJECT_PRODUCTION_URL as string | undefined;
const protocol = productionUrl?.startsWith('https') ? 'https' : 'http';
const url = new URL(`${protocol}://${productionUrl || 'localhost:3000'}`);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: '/',
        userAgent: '*',
      },
    ],
    sitemap: new URL('/sitemap.xml', url.href).href,
  };
}
