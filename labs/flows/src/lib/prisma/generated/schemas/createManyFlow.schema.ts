import { z } from 'zod';
import { FlowCreateManyInputObjectSchema } from './objects/FlowCreateManyInput.schema';

export const FlowCreateManySchema = z.object({
  data: z.union([
    FlowCreateManyInputObjectSchema,
    z.array(FlowCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
