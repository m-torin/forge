import { z } from 'zod';
import { InstanceCreateManyInputObjectSchema } from './objects/InstanceCreateManyInput.schema';

export const InstanceCreateManySchema = z.object({
  data: z.union([
    InstanceCreateManyInputObjectSchema,
    z.array(InstanceCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
