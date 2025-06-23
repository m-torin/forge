import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressCreateManyUserInputSchema } from './AddressCreateManyUserInputSchema';

export const AddressCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.AddressCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => AddressCreateManyUserInputSchema),
        z.lazy(() => AddressCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default AddressCreateManyUserInputEnvelopeSchema;
