import { z } from 'zod';
import { FlowEventOrderByWithRelationInputObjectSchema } from './objects/FlowEventOrderByWithRelationInput.schema';
import { FlowEventWhereInputObjectSchema } from './objects/FlowEventWhereInput.schema';
import { FlowEventWhereUniqueInputObjectSchema } from './objects/FlowEventWhereUniqueInput.schema';
import { FlowEventCountAggregateInputObjectSchema } from './objects/FlowEventCountAggregateInput.schema';
import { FlowEventMinAggregateInputObjectSchema } from './objects/FlowEventMinAggregateInput.schema';
import { FlowEventMaxAggregateInputObjectSchema } from './objects/FlowEventMaxAggregateInput.schema';
import { FlowEventAvgAggregateInputObjectSchema } from './objects/FlowEventAvgAggregateInput.schema';
import { FlowEventSumAggregateInputObjectSchema } from './objects/FlowEventSumAggregateInput.schema';

export const FlowEventAggregateSchema = z.object({
  orderBy: z
    .union([
      FlowEventOrderByWithRelationInputObjectSchema,
      FlowEventOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowEventWhereInputObjectSchema.optional(),
  cursor: FlowEventWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), FlowEventCountAggregateInputObjectSchema])
    .optional(),
  _min: FlowEventMinAggregateInputObjectSchema.optional(),
  _max: FlowEventMaxAggregateInputObjectSchema.optional(),
  _avg: FlowEventAvgAggregateInputObjectSchema.optional(),
  _sum: FlowEventSumAggregateInputObjectSchema.optional(),
});
