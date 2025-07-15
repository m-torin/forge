import { z } from 'zod';
import { InfrastructureOrderByWithRelationInputObjectSchema } from './objects/InfrastructureOrderByWithRelationInput.schema';
import { InfrastructureWhereInputObjectSchema } from './objects/InfrastructureWhereInput.schema';
import { InfrastructureWhereUniqueInputObjectSchema } from './objects/InfrastructureWhereUniqueInput.schema';
import { InfrastructureCountAggregateInputObjectSchema } from './objects/InfrastructureCountAggregateInput.schema';
import { InfrastructureMinAggregateInputObjectSchema } from './objects/InfrastructureMinAggregateInput.schema';
import { InfrastructureMaxAggregateInputObjectSchema } from './objects/InfrastructureMaxAggregateInput.schema';

export const InfrastructureAggregateSchema = z.object({
  orderBy: z
    .union([
      InfrastructureOrderByWithRelationInputObjectSchema,
      InfrastructureOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: InfrastructureWhereInputObjectSchema.optional(),
  cursor: InfrastructureWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), InfrastructureCountAggregateInputObjectSchema])
    .optional(),
  _min: InfrastructureMinAggregateInputObjectSchema.optional(),
  _max: InfrastructureMaxAggregateInputObjectSchema.optional(),
});
