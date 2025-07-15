import { z } from 'zod';
import { InstanceWhereInputObjectSchema } from './objects/InstanceWhereInput.schema';
import { InstanceOrderByWithAggregationInputObjectSchema } from './objects/InstanceOrderByWithAggregationInput.schema';
import { InstanceScalarWhereWithAggregatesInputObjectSchema } from './objects/InstanceScalarWhereWithAggregatesInput.schema';
import { InstanceScalarFieldEnumSchema } from './enums/InstanceScalarFieldEnum.schema';

export const InstanceGroupBySchema = z.object({
  where: InstanceWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      InstanceOrderByWithAggregationInputObjectSchema,
      InstanceOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: InstanceScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(InstanceScalarFieldEnumSchema),
});
