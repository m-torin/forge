import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateManyUserInputSchema } from './CollectionCreateManyUserInputSchema';

export const CollectionCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CollectionCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => CollectionCreateManyUserInputSchema),
        z.lazy(() => CollectionCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default CollectionCreateManyUserInputEnvelopeSchema;
