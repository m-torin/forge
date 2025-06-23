import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionSelectSchema } from '../inputTypeSchemas/InventoryTransactionSelectSchema';
import { InventoryTransactionIncludeSchema } from '../inputTypeSchemas/InventoryTransactionIncludeSchema';

export const InventoryTransactionArgsSchema: z.ZodType<Prisma.InventoryTransactionDefaultArgs> = z
  .object({
    select: z.lazy(() => InventoryTransactionSelectSchema).optional(),
    include: z.lazy(() => InventoryTransactionIncludeSchema).optional(),
  })
  .strict();

export default InventoryTransactionArgsSchema;
