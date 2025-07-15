import { z } from 'zod';
import { FlowStatisticsSelectObjectSchema } from './objects/FlowStatisticsSelect.schema';
import { FlowStatisticsIncludeObjectSchema } from './objects/FlowStatisticsInclude.schema';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './objects/FlowStatisticsWhereUniqueInput.schema';

export const FlowStatisticsDeleteOneSchema = z.object({
  select: FlowStatisticsSelectObjectSchema.optional(),
  include: FlowStatisticsIncludeObjectSchema.optional(),
  where: FlowStatisticsWhereUniqueInputObjectSchema,
});
