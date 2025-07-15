import { z } from 'zod';
import { FlowRunCreateManyInputObjectSchema } from './objects/FlowRunCreateManyInput.schema';

export const FlowRunCreateManySchema = z.object({
  data: z.union([
    FlowRunCreateManyInputObjectSchema,
    z.array(FlowRunCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
