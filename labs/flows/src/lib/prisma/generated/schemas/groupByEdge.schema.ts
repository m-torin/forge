import { z } from 'zod';
import { EdgeWhereInputObjectSchema } from './objects/EdgeWhereInput.schema';
import { EdgeOrderByWithAggregationInputObjectSchema } from './objects/EdgeOrderByWithAggregationInput.schema';
import { EdgeScalarWhereWithAggregatesInputObjectSchema } from './objects/EdgeScalarWhereWithAggregatesInput.schema';
import { EdgeScalarFieldEnumSchema } from './enums/EdgeScalarFieldEnum.schema';

export const EdgeGroupBySchema = z.object({
  where: EdgeWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      EdgeOrderByWithAggregationInputObjectSchema,
      EdgeOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: EdgeScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(EdgeScalarFieldEnumSchema),
});
