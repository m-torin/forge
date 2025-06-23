import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryWhereInputSchema } from '../inputTypeSchemas/InventoryWhereInputSchema';
import { InventoryOrderByWithRelationInputSchema } from '../inputTypeSchemas/InventoryOrderByWithRelationInputSchema';
import { InventoryWhereUniqueInputSchema } from '../inputTypeSchemas/InventoryWhereUniqueInputSchema';

export const InventoryAggregateArgsSchema: z.ZodType<Prisma.InventoryAggregateArgs> = z
  .object({
    where: InventoryWhereInputSchema.optional(),
    orderBy: z
      .union([
        InventoryOrderByWithRelationInputSchema.array(),
        InventoryOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: InventoryWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default InventoryAggregateArgsSchema;
