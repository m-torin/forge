import { z } from 'zod';
import { NodeOrderByWithRelationInputObjectSchema } from './objects/NodeOrderByWithRelationInput.schema';
import { NodeWhereInputObjectSchema } from './objects/NodeWhereInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './objects/NodeWhereUniqueInput.schema';
import { NodeCountAggregateInputObjectSchema } from './objects/NodeCountAggregateInput.schema';
import { NodeMinAggregateInputObjectSchema } from './objects/NodeMinAggregateInput.schema';
import { NodeMaxAggregateInputObjectSchema } from './objects/NodeMaxAggregateInput.schema';

export const NodeAggregateSchema = z.object({
  orderBy: z
    .union([
      NodeOrderByWithRelationInputObjectSchema,
      NodeOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: NodeWhereInputObjectSchema.optional(),
  cursor: NodeWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), NodeCountAggregateInputObjectSchema])
    .optional(),
  _min: NodeMinAggregateInputObjectSchema.optional(),
  _max: NodeMaxAggregateInputObjectSchema.optional(),
});
