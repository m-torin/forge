import { z } from 'zod';
import { FlowStatisticsSelectObjectSchema } from './objects/FlowStatisticsSelect.schema';
import { FlowStatisticsIncludeObjectSchema } from './objects/FlowStatisticsInclude.schema';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './objects/FlowStatisticsWhereUniqueInput.schema';
import { FlowStatisticsCreateInputObjectSchema } from './objects/FlowStatisticsCreateInput.schema';
import { FlowStatisticsUncheckedCreateInputObjectSchema } from './objects/FlowStatisticsUncheckedCreateInput.schema';
import { FlowStatisticsUpdateInputObjectSchema } from './objects/FlowStatisticsUpdateInput.schema';
import { FlowStatisticsUncheckedUpdateInputObjectSchema } from './objects/FlowStatisticsUncheckedUpdateInput.schema';

export const FlowStatisticsUpsertSchema = z.object({
  select: FlowStatisticsSelectObjectSchema.optional(),
  include: FlowStatisticsIncludeObjectSchema.optional(),
  where: FlowStatisticsWhereUniqueInputObjectSchema,
  create: z.union([
    FlowStatisticsCreateInputObjectSchema,
    FlowStatisticsUncheckedCreateInputObjectSchema,
  ]),
  update: z.union([
    FlowStatisticsUpdateInputObjectSchema,
    FlowStatisticsUncheckedUpdateInputObjectSchema,
  ]),
});
