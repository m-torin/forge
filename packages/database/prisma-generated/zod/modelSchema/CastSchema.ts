import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// CAST SCHEMA
/////////////////////////////////////////

export const CastSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  isFictional: z.boolean(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
})

export type Cast = z.infer<typeof CastSchema>

export default CastSchema;
