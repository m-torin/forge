import { z } from 'zod';
import { ScheduledJobCreateManyInputObjectSchema } from './objects/ScheduledJobCreateManyInput.schema';

export const ScheduledJobCreateManySchema = z.object({
  data: z.union([
    ScheduledJobCreateManyInputObjectSchema,
    z.array(ScheduledJobCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
