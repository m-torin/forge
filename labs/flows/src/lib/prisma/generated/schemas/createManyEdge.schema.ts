import { z } from 'zod';
import { EdgeCreateManyInputObjectSchema } from './objects/EdgeCreateManyInput.schema';

export const EdgeCreateManySchema = z.object({
  data: z.union([
    EdgeCreateManyInputObjectSchema,
    z.array(EdgeCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
