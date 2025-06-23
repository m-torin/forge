import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionWhereInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereInputSchema';

export const InventoryTransactionDeleteManyArgsSchema: z.ZodType<Prisma.InventoryTransactionDeleteManyArgs> =
  z
    .object({
      where: InventoryTransactionWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default InventoryTransactionDeleteManyArgsSchema;
