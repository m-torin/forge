import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinWhereInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinWhereInputSchema';
import { RegistryPurchaseJoinOrderByWithRelationInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinOrderByWithRelationInputSchema';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinWhereUniqueInputSchema';

export const RegistryPurchaseJoinAggregateArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinAggregateArgs> =
  z
    .object({
      where: RegistryPurchaseJoinWhereInputSchema.optional(),
      orderBy: z
        .union([
          RegistryPurchaseJoinOrderByWithRelationInputSchema.array(),
          RegistryPurchaseJoinOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: RegistryPurchaseJoinWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
    })
    .strict();

export default RegistryPurchaseJoinAggregateArgsSchema;
