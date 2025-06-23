import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';

/////////////////////////////////////////
// STORY SCHEMA
/////////////////////////////////////////

export const StorySchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  seriesId: z.string().nullable(),
  fandomId: z.string(),
  displayOrder: z.number().int(),
  isFictional: z.boolean(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
});

export type Story = z.infer<typeof StorySchema>;

export default StorySchema;
