import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinWhereInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinWhereInputSchema';
import { RegistryPurchaseJoinOrderByWithAggregationInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinOrderByWithAggregationInputSchema';
import { RegistryPurchaseJoinScalarFieldEnumSchema } from '../inputTypeSchemas/RegistryPurchaseJoinScalarFieldEnumSchema';
import { RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema';

export const RegistryPurchaseJoinGroupByArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinGroupByArgs> =
  z
    .object({
      where: RegistryPurchaseJoinWhereInputSchema.optional(),
      orderBy: z
        .union([
          RegistryPurchaseJoinOrderByWithAggregationInputSchema.array(),
          RegistryPurchaseJoinOrderByWithAggregationInputSchema,
        ])
        .optional(),
      by: RegistryPurchaseJoinScalarFieldEnumSchema.array(),
      having: RegistryPurchaseJoinScalarWhereWithAggregatesInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
    })
    .strict();

export default RegistryPurchaseJoinGroupByArgsSchema;
