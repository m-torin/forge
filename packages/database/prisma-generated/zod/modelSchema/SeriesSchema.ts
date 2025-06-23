import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';

/////////////////////////////////////////
// SERIES SCHEMA
/////////////////////////////////////////

export const SeriesSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  fandomId: z.string(),
  displayOrder: z.number().int(),
  isFictional: z.boolean(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
});

export type Series = z.infer<typeof SeriesSchema>;

export default SeriesSchema;
