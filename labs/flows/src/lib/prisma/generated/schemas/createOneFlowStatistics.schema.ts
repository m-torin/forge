import { z } from 'zod';
import { FlowStatisticsSelectObjectSchema } from './objects/FlowStatisticsSelect.schema';
import { FlowStatisticsIncludeObjectSchema } from './objects/FlowStatisticsInclude.schema';
import { FlowStatisticsCreateInputObjectSchema } from './objects/FlowStatisticsCreateInput.schema';
import { FlowStatisticsUncheckedCreateInputObjectSchema } from './objects/FlowStatisticsUncheckedCreateInput.schema';

export const FlowStatisticsCreateOneSchema = z.object({
  select: FlowStatisticsSelectObjectSchema.optional(),
  include: FlowStatisticsIncludeObjectSchema.optional(),
  data: z.union([
    FlowStatisticsCreateInputObjectSchema,
    FlowStatisticsUncheckedCreateInputObjectSchema,
  ]),
});
