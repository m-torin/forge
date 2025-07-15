import { z } from 'zod';
import { SecretWhereInputObjectSchema } from './objects/SecretWhereInput.schema';
import { SecretOrderByWithAggregationInputObjectSchema } from './objects/SecretOrderByWithAggregationInput.schema';
import { SecretScalarWhereWithAggregatesInputObjectSchema } from './objects/SecretScalarWhereWithAggregatesInput.schema';
import { SecretScalarFieldEnumSchema } from './enums/SecretScalarFieldEnum.schema';

export const SecretGroupBySchema = z.object({
  where: SecretWhereInputObjectSchema.optional(),
  orderBy: z
    .union([
      SecretOrderByWithAggregationInputObjectSchema,
      SecretOrderByWithAggregationInputObjectSchema.array(),
    ])
    .optional(),
  having: SecretScalarWhereWithAggregatesInputObjectSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  by: z.array(SecretScalarFieldEnumSchema),
});
