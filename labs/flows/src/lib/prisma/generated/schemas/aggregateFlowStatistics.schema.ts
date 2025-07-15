import { z } from 'zod';
import { FlowStatisticsOrderByWithRelationInputObjectSchema } from './objects/FlowStatisticsOrderByWithRelationInput.schema';
import { FlowStatisticsWhereInputObjectSchema } from './objects/FlowStatisticsWhereInput.schema';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './objects/FlowStatisticsWhereUniqueInput.schema';
import { FlowStatisticsCountAggregateInputObjectSchema } from './objects/FlowStatisticsCountAggregateInput.schema';
import { FlowStatisticsMinAggregateInputObjectSchema } from './objects/FlowStatisticsMinAggregateInput.schema';
import { FlowStatisticsMaxAggregateInputObjectSchema } from './objects/FlowStatisticsMaxAggregateInput.schema';
import { FlowStatisticsAvgAggregateInputObjectSchema } from './objects/FlowStatisticsAvgAggregateInput.schema';
import { FlowStatisticsSumAggregateInputObjectSchema } from './objects/FlowStatisticsSumAggregateInput.schema';

export const FlowStatisticsAggregateSchema = z.object({
  orderBy: z
    .union([
      FlowStatisticsOrderByWithRelationInputObjectSchema,
      FlowStatisticsOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowStatisticsWhereInputObjectSchema.optional(),
  cursor: FlowStatisticsWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), FlowStatisticsCountAggregateInputObjectSchema])
    .optional(),
  _min: FlowStatisticsMinAggregateInputObjectSchema.optional(),
  _max: FlowStatisticsMaxAggregateInputObjectSchema.optional(),
  _avg: FlowStatisticsAvgAggregateInputObjectSchema.optional(),
  _sum: FlowStatisticsSumAggregateInputObjectSchema.optional(),
});
