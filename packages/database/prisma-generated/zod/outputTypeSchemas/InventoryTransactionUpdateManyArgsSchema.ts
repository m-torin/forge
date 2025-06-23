import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionUpdateManyMutationInputSchema } from '../inputTypeSchemas/InventoryTransactionUpdateManyMutationInputSchema';
import { InventoryTransactionUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/InventoryTransactionUncheckedUpdateManyInputSchema';
import { InventoryTransactionWhereInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereInputSchema';

export const InventoryTransactionUpdateManyArgsSchema: z.ZodType<Prisma.InventoryTransactionUpdateManyArgs> =
  z
    .object({
      data: z.union([
        InventoryTransactionUpdateManyMutationInputSchema,
        InventoryTransactionUncheckedUpdateManyInputSchema,
      ]),
      where: InventoryTransactionWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default InventoryTransactionUpdateManyArgsSchema;
