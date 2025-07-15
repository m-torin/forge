import { z } from 'zod';
import { FlowStatisticsCreateManyInputObjectSchema } from './objects/FlowStatisticsCreateManyInput.schema';

export const FlowStatisticsCreateManySchema = z.object({
  data: z.union([
    FlowStatisticsCreateManyInputObjectSchema,
    z.array(FlowStatisticsCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
