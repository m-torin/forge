import { z } from 'zod';
import { FlowStatisticsSelectObjectSchema } from './objects/FlowStatisticsSelect.schema';
import { FlowStatisticsIncludeObjectSchema } from './objects/FlowStatisticsInclude.schema';
import { FlowStatisticsUpdateInputObjectSchema } from './objects/FlowStatisticsUpdateInput.schema';
import { FlowStatisticsUncheckedUpdateInputObjectSchema } from './objects/FlowStatisticsUncheckedUpdateInput.schema';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './objects/FlowStatisticsWhereUniqueInput.schema';

export const FlowStatisticsUpdateOneSchema = z.object({
  select: FlowStatisticsSelectObjectSchema.optional(),
  include: FlowStatisticsIncludeObjectSchema.optional(),
  data: z.union([
    FlowStatisticsUpdateInputObjectSchema,
    FlowStatisticsUncheckedUpdateInputObjectSchema,
  ]),
  where: FlowStatisticsWhereUniqueInputObjectSchema,
});
