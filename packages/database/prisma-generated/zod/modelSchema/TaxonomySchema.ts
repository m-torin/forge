import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { TaxonomyTypeSchema } from '../inputTypeSchemas/TaxonomyTypeSchema'
import { ContentStatusSchema } from '../inputTypeSchemas/ContentStatusSchema'

/////////////////////////////////////////
// TAXONOMY SCHEMA
/////////////////////////////////////////

export const TaxonomySchema = z.object({
  type: TaxonomyTypeSchema,
  status: ContentStatusSchema,
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
})

export type Taxonomy = z.infer<typeof TaxonomySchema>

export default TaxonomySchema;
