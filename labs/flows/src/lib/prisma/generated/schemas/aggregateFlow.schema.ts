import { z } from 'zod';
import { FlowOrderByWithRelationInputObjectSchema } from './objects/FlowOrderByWithRelationInput.schema';
import { FlowWhereInputObjectSchema } from './objects/FlowWhereInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './objects/FlowWhereUniqueInput.schema';
import { FlowCountAggregateInputObjectSchema } from './objects/FlowCountAggregateInput.schema';
import { FlowMinAggregateInputObjectSchema } from './objects/FlowMinAggregateInput.schema';
import { FlowMaxAggregateInputObjectSchema } from './objects/FlowMaxAggregateInput.schema';

export const FlowAggregateSchema = z.object({
  orderBy: z
    .union([
      FlowOrderByWithRelationInputObjectSchema,
      FlowOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: FlowWhereInputObjectSchema.optional(),
  cursor: FlowWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), FlowCountAggregateInputObjectSchema])
    .optional(),
  _min: FlowMinAggregateInputObjectSchema.optional(),
  _max: FlowMaxAggregateInputObjectSchema.optional(),
});
