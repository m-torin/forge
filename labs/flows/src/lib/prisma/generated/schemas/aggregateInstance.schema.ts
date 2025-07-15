import { z } from 'zod';
import { InstanceOrderByWithRelationInputObjectSchema } from './objects/InstanceOrderByWithRelationInput.schema';
import { InstanceWhereInputObjectSchema } from './objects/InstanceWhereInput.schema';
import { InstanceWhereUniqueInputObjectSchema } from './objects/InstanceWhereUniqueInput.schema';
import { InstanceCountAggregateInputObjectSchema } from './objects/InstanceCountAggregateInput.schema';
import { InstanceMinAggregateInputObjectSchema } from './objects/InstanceMinAggregateInput.schema';
import { InstanceMaxAggregateInputObjectSchema } from './objects/InstanceMaxAggregateInput.schema';

export const InstanceAggregateSchema = z.object({
  orderBy: z
    .union([
      InstanceOrderByWithRelationInputObjectSchema,
      InstanceOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: InstanceWhereInputObjectSchema.optional(),
  cursor: InstanceWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), InstanceCountAggregateInputObjectSchema])
    .optional(),
  _min: InstanceMinAggregateInputObjectSchema.optional(),
  _max: InstanceMaxAggregateInputObjectSchema.optional(),
});
