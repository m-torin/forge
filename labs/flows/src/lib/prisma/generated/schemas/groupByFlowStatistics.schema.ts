import { z } from 'zod';
import { FlowStatisticsWhereInputObjectSchema } from './objects/FlowStatisticsWhereInput.schema';
import { FlowStatisticsOrderByWithAggregationInputObjectSchema } from './objects/FlowStatisticsOrderByWithAggregationInput.schema';
import { FlowStatisticsScalarWhereWithAggregatesInputObjectSchema } from './objects/FlowStatisticsScalarWhereWithAggregatesInput.schema';
import { FlowStatisticsScalarFieldEnumSchema } from './enums/FlowStatisticsScalarFieldEnum.schema';

export const FlowStatisticsGroupBySchema = z.object({
  where: FlowStatisticsWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      FlowStatisticsOrderByWithAggregationInputObjectSchema,
      FlowStatisticsOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: FlowStatisticsScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(FlowStatisticsScalarFieldEnumSchema),
});
