import { z } from 'zod';
import { FlowStatisticsWhereInputObjectSchema } from './objects/FlowStatisticsWhereInput.schema';

export const FlowStatisticsDeleteManySchema = z.object({
  where: FlowStatisticsWhereInputObjectSchema.optional(),
});
