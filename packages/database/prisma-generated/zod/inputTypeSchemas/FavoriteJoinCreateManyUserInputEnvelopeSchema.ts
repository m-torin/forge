import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateManyUserInputSchema } from './FavoriteJoinCreateManyUserInputSchema';

export const FavoriteJoinCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.FavoriteJoinCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => FavoriteJoinCreateManyUserInputSchema),
        z.lazy(() => FavoriteJoinCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default FavoriteJoinCreateManyUserInputEnvelopeSchema;
