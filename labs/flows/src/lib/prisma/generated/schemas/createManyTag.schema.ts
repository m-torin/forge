import { z } from 'zod';
import { TagCreateManyInputObjectSchema } from './objects/TagCreateManyInput.schema';

export const TagCreateManySchema = z.object({
  data: z.union([
    TagCreateManyInputObjectSchema,
    z.array(TagCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
