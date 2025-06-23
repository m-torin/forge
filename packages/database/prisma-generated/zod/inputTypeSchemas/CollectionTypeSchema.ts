import { z } from 'zod';

export const CollectionTypeSchema = z.enum([
  'SEASONAL',
  'THEMATIC',
  'PRODUCT_LINE',
  'BRAND_LINE',
  'PROMOTIONAL',
  'CURATED',
  'TRENDING',
  'FEATURED',
  'NEW_ARRIVALS',
  'BEST_SELLERS',
  'CLEARANCE',
  'LIMITED_EDITION',
  'COLLABORATION',
  'EXCLUSIVE',
  'BUNDLE',
  'SET',
  'OTHER',
]);

export type CollectionTypeType = `${z.infer<typeof CollectionTypeSchema>}`;

export default CollectionTypeSchema;
