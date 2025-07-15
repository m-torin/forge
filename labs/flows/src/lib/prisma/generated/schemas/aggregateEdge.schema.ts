import { z } from 'zod';
import { EdgeOrderByWithRelationInputObjectSchema } from './objects/EdgeOrderByWithRelationInput.schema';
import { EdgeWhereInputObjectSchema } from './objects/EdgeWhereInput.schema';
import { EdgeWhereUniqueInputObjectSchema } from './objects/EdgeWhereUniqueInput.schema';
import { EdgeCountAggregateInputObjectSchema } from './objects/EdgeCountAggregateInput.schema';
import { EdgeMinAggregateInputObjectSchema } from './objects/EdgeMinAggregateInput.schema';
import { EdgeMaxAggregateInputObjectSchema } from './objects/EdgeMaxAggregateInput.schema';

export const EdgeAggregateSchema = z.object({
  orderBy: z
    .union([
      EdgeOrderByWithRelationInputObjectSchema,
      EdgeOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: EdgeWhereInputObjectSchema.optional(),
  cursor: EdgeWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), EdgeCountAggregateInputObjectSchema])
    .optional(),
  _min: EdgeMinAggregateInputObjectSchema.optional(),
  _max: EdgeMaxAggregateInputObjectSchema.optional(),
});
