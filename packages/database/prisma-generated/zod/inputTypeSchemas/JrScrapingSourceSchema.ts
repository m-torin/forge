import { z } from 'zod';

export const JrScrapingSourceSchema = z.enum([
  'ANY',
  'SCRAPING_BEE',
  'PLAYWRIGHT',
  'PUPPETEER',
  'BRIGHTDATA',
  'SCRAPERAPI',
  'CUSTOM',
]);

export type JrScrapingSourceType = `${z.infer<typeof JrScrapingSourceSchema>}`;

export default JrScrapingSourceSchema;
