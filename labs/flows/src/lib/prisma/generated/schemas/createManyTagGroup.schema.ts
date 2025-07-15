import { z } from 'zod';
import { TagGroupCreateManyInputObjectSchema } from './objects/TagGroupCreateManyInput.schema';

export const TagGroupCreateManySchema = z.object({
  data: z.union([
    TagGroupCreateManyInputObjectSchema,
    z.array(TagGroupCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
