import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { BrandTypeSchema } from '../inputTypeSchemas/BrandTypeSchema';
import { ContentStatusSchema } from '../inputTypeSchemas/ContentStatusSchema';

/////////////////////////////////////////
// BRAND SCHEMA
/////////////////////////////////////////

export const BrandSchema = z.object({
  type: BrandTypeSchema,
  status: ContentStatusSchema,
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  baseUrl: z.string().nullable(),
  copy: JsonValueSchema,
  parentId: z.string().nullable(),
  displayOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
});

export type Brand = z.infer<typeof BrandSchema>;

export default BrandSchema;
