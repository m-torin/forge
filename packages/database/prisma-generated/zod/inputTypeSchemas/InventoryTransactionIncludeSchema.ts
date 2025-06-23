import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryArgsSchema } from '../outputTypeSchemas/InventoryArgsSchema';

export const InventoryTransactionIncludeSchema: z.ZodType<Prisma.InventoryTransactionInclude> = z
  .object({
    inventory: z.union([z.boolean(), z.lazy(() => InventoryArgsSchema)]).optional(),
  })
  .strict();

export default InventoryTransactionIncludeSchema;
