import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';

/////////////////////////////////////////
// FANDOM SCHEMA
/////////////////////////////////////////

export const FandomSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  isFictional: z.boolean(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
});

export type Fandom = z.infer<typeof FandomSchema>;

export default FandomSchema;
