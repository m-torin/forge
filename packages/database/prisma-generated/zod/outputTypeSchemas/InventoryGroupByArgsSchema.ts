import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryWhereInputSchema } from '../inputTypeSchemas/InventoryWhereInputSchema';
import { InventoryOrderByWithAggregationInputSchema } from '../inputTypeSchemas/InventoryOrderByWithAggregationInputSchema';
import { InventoryScalarFieldEnumSchema } from '../inputTypeSchemas/InventoryScalarFieldEnumSchema';
import { InventoryScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/InventoryScalarWhereWithAggregatesInputSchema';

export const InventoryGroupByArgsSchema: z.ZodType<Prisma.InventoryGroupByArgs> = z
  .object({
    where: InventoryWhereInputSchema.optional(),
    orderBy: z
      .union([
        InventoryOrderByWithAggregationInputSchema.array(),
        InventoryOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: InventoryScalarFieldEnumSchema.array(),
    having: InventoryScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default InventoryGroupByArgsSchema;
