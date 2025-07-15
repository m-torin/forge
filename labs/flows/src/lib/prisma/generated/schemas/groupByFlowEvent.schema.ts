import { z } from 'zod';
import { FlowEventWhereInputObjectSchema } from './objects/FlowEventWhereInput.schema';
import { FlowEventOrderByWithAggregationInputObjectSchema } from './objects/FlowEventOrderByWithAggregationInput.schema';
import { FlowEventScalarWhereWithAggregatesInputObjectSchema } from './objects/FlowEventScalarWhereWithAggregatesInput.schema';
import { FlowEventScalarFieldEnumSchema } from './enums/FlowEventScalarFieldEnum.schema';

export const FlowEventGroupBySchema = z.object({
  where: FlowEventWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      FlowEventOrderByWithAggregationInputObjectSchema,
      FlowEventOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: FlowEventScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(FlowEventScalarFieldEnumSchema),
});
