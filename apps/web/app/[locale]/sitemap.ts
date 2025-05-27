import fs from 'node:fs';

import { env } from '@/env';

import type { MetadataRoute } from 'next';

const appFolders = fs.readdirSync('app', { withFileTypes: true });
const pages = appFolders
  .filter((file) => file.isDirectory())
  .filter((folder) => !folder.name.startsWith('_'))
  .filter((folder) => !folder.name.startsWith('('))
  .map((folder) => folder.name);

// Static blog and legal pages
const blogs = ['hello-world'];
const legals = ['privacy', 'terms'];

const productionUrl = env.VERCEL_PROJECT_PRODUCTION_URL as string | undefined;
const protocol = productionUrl?.startsWith('https') ? 'https' : 'http';
const url = new URL(`${protocol}://${productionUrl || 'localhost:3000'}`);

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: new URL('/', url).href,
    lastModified: new Date(),
  },
  ...pages.map((page) => ({
    url: new URL(page, url).href,
    lastModified: new Date(),
  })),
  ...blogs.map((blog) => ({
    url: new URL(`blog/${blog}`, url).href,
    lastModified: new Date(),
  })),
  ...legals.map((legal) => ({
    url: new URL(`legal/${legal}`, url).href,
    lastModified: new Date(),
  })),
];

export default sitemap;
