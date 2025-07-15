import { z } from 'zod';
import { FlowStatisticsUpdateManyMutationInputObjectSchema } from './objects/FlowStatisticsUpdateManyMutationInput.schema';
import { FlowStatisticsWhereInputObjectSchema } from './objects/FlowStatisticsWhereInput.schema';

export const FlowStatisticsUpdateManySchema = z.object({
  data: FlowStatisticsUpdateManyMutationInputObjectSchema,
  where: FlowStatisticsWhereInputObjectSchema.optional(),
});
