import { z } from 'zod';
import { FlowRunWhereInputObjectSchema } from './objects/FlowRunWhereInput.schema';
import { FlowRunOrderByWithAggregationInputObjectSchema } from './objects/FlowRunOrderByWithAggregationInput.schema';
import { FlowRunScalarWhereWithAggregatesInputObjectSchema } from './objects/FlowRunScalarWhereWithAggregatesInput.schema';
import { FlowRunScalarFieldEnumSchema } from './enums/FlowRunScalarFieldEnum.schema';

export const FlowRunGroupBySchema = z.object({
  where: FlowRunWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      FlowRunOrderByWithAggregationInputObjectSchema,
      FlowRunOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: FlowRunScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(FlowRunScalarFieldEnumSchema),
});
