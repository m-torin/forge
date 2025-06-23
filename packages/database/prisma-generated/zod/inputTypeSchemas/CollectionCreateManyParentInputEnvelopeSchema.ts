import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateManyParentInputSchema } from './CollectionCreateManyParentInputSchema';

export const CollectionCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.CollectionCreateManyParentInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => CollectionCreateManyParentInputSchema),
        z.lazy(() => CollectionCreateManyParentInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default CollectionCreateManyParentInputEnvelopeSchema;
