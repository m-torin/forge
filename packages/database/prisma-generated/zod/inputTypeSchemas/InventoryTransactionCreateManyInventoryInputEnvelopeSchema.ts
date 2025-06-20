import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionCreateManyInventoryInputSchema } from './InventoryTransactionCreateManyInventoryInputSchema';

export const InventoryTransactionCreateManyInventoryInputEnvelopeSchema: z.ZodType<Prisma.InventoryTransactionCreateManyInventoryInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => InventoryTransactionCreateManyInventoryInputSchema),z.lazy(() => InventoryTransactionCreateManyInventoryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default InventoryTransactionCreateManyInventoryInputEnvelopeSchema;
