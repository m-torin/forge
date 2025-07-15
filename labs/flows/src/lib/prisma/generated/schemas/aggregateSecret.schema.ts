import { z } from 'zod';
import { SecretOrderByWithRelationInputObjectSchema } from './objects/SecretOrderByWithRelationInput.schema';
import { SecretWhereInputObjectSchema } from './objects/SecretWhereInput.schema';
import { SecretWhereUniqueInputObjectSchema } from './objects/SecretWhereUniqueInput.schema';
import { SecretCountAggregateInputObjectSchema } from './objects/SecretCountAggregateInput.schema';
import { SecretMinAggregateInputObjectSchema } from './objects/SecretMinAggregateInput.schema';
import { SecretMaxAggregateInputObjectSchema } from './objects/SecretMaxAggregateInput.schema';
import { SecretAvgAggregateInputObjectSchema } from './objects/SecretAvgAggregateInput.schema';
import { SecretSumAggregateInputObjectSchema } from './objects/SecretSumAggregateInput.schema';

export const SecretAggregateSchema = z.object({
  orderBy: z
    .union([
      SecretOrderByWithRelationInputObjectSchema,
      SecretOrderByWithRelationInputObjectSchema.array(),
    ])
    .optional(),
  where: SecretWhereInputObjectSchema.optional(),
  cursor: SecretWhereUniqueInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  _count: z
    .union([z.literal(true), SecretCountAggregateInputObjectSchema])
    .optional(),
  _min: SecretMinAggregateInputObjectSchema.optional(),
  _max: SecretMaxAggregateInputObjectSchema.optional(),
  _avg: SecretAvgAggregateInputObjectSchema.optional(),
  _sum: SecretSumAggregateInputObjectSchema.optional(),
});
