import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { CollectionTypeSchema } from '../inputTypeSchemas/CollectionTypeSchema';
import { ContentStatusSchema } from '../inputTypeSchemas/ContentStatusSchema';

/////////////////////////////////////////
// COLLECTION SCHEMA
/////////////////////////////////////////

export const CollectionSchema = z.object({
  type: CollectionTypeSchema,
  status: ContentStatusSchema,
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  userId: z.string().nullable(),
  copy: JsonValueSchema,
  parentId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
});

export type Collection = z.infer<typeof CollectionSchema>;

export default CollectionSchema;
