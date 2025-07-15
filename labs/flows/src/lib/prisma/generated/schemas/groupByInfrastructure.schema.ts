import { z } from 'zod';
import { InfrastructureWhereInputObjectSchema } from './objects/InfrastructureWhereInput.schema';
import { InfrastructureOrderByWithAggregationInputObjectSchema } from './objects/InfrastructureOrderByWithAggregationInput.schema';
import { InfrastructureScalarWhereWithAggregatesInputObjectSchema } from './objects/InfrastructureScalarWhereWithAggregatesInput.schema';
import { InfrastructureScalarFieldEnumSchema } from './enums/InfrastructureScalarFieldEnum.schema';

export const InfrastructureGroupBySchema = z.object({
  where: InfrastructureWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      InfrastructureOrderByWithAggregationInputObjectSchema,
      InfrastructureOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: InfrastructureScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(InfrastructureScalarFieldEnumSchema),
});
