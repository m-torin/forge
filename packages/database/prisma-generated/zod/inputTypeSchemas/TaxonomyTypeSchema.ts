import { z } from 'zod';

export const TaxonomyTypeSchema = z.enum([
  'TAG',
  'ATTRACTION',
  'THING',
  'COLOR',
  'MATERIAL',
  'EVENT',
  'ENTERTAINMENT',
  'OTHER',
]);

export type TaxonomyTypeType = `${z.infer<typeof TaxonomyTypeSchema>}`;

export default TaxonomyTypeSchema;
