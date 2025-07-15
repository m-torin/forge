import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './objects/FlowWhereInput.schema';
import { FlowOrderByWithAggregationInputObjectSchema } from './objects/FlowOrderByWithAggregationInput.schema';
import { FlowScalarWhereWithAggregatesInputObjectSchema } from './objects/FlowScalarWhereWithAggregatesInput.schema';
import { FlowScalarFieldEnumSchema } from './enums/FlowScalarFieldEnum.schema';

export const FlowGroupBySchema = z.object({
  where: FlowWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      FlowOrderByWithAggregationInputObjectSchema,
      FlowOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: FlowScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(FlowScalarFieldEnumSchema),
});
