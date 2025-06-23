import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { ContentStatusSchema } from '../inputTypeSchemas/ContentStatusSchema';

/////////////////////////////////////////
// PRODUCT CATEGORY SCHEMA
/////////////////////////////////////////

export const ProductCategorySchema = z.object({
  status: ContentStatusSchema,
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  copy: JsonValueSchema,
  parentId: z.string().nullable(),
  displayOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
});

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export default ProductCategorySchema;
