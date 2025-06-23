import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { InventoryTransactionFindManyArgsSchema } from '../outputTypeSchemas/InventoryTransactionFindManyArgsSchema';
import { InventoryCountOutputTypeArgsSchema } from '../outputTypeSchemas/InventoryCountOutputTypeArgsSchema';

export const InventoryIncludeSchema: z.ZodType<Prisma.InventoryInclude> = z
  .object({
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    variant: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    transactions: z
      .union([z.boolean(), z.lazy(() => InventoryTransactionFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => InventoryCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export default InventoryIncludeSchema;
