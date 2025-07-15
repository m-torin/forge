import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './objects/NodeWhereInput.schema';
import { NodeOrderByWithAggregationInputObjectSchema } from './objects/NodeOrderByWithAggregationInput.schema';
import { NodeScalarWhereWithAggregatesInputObjectSchema } from './objects/NodeScalarWhereWithAggregatesInput.schema';
import { NodeScalarFieldEnumSchema } from './enums/NodeScalarFieldEnum.schema';

export const NodeGroupBySchema = z.object({
  where: NodeWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      NodeOrderByWithAggregationInputObjectSchema,
      NodeOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: NodeScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(NodeScalarFieldEnumSchema),
});
