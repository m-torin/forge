import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateManyProductInputSchema } from './InventoryCreateManyProductInputSchema';

export const InventoryCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.InventoryCreateManyProductInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => InventoryCreateManyProductInputSchema),
        z.lazy(() => InventoryCreateManyProductInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default InventoryCreateManyProductInputEnvelopeSchema;
