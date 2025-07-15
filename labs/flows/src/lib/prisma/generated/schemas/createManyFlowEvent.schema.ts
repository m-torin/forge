import { z } from 'zod';
import { FlowEventCreateManyInputObjectSchema } from './objects/FlowEventCreateManyInput.schema';

export const FlowEventCreateManySchema = z.object({
  data: z.union([
    FlowEventCreateManyInputObjectSchema,
    z.array(FlowEventCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
