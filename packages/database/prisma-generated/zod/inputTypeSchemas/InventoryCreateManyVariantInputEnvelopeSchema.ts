import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateManyVariantInputSchema } from './InventoryCreateManyVariantInputSchema';

export const InventoryCreateManyVariantInputEnvelopeSchema: z.ZodType<Prisma.InventoryCreateManyVariantInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => InventoryCreateManyVariantInputSchema),z.lazy(() => InventoryCreateManyVariantInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default InventoryCreateManyVariantInputEnvelopeSchema;
