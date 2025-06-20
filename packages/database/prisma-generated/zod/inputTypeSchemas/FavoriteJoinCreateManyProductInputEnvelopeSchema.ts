import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateManyProductInputSchema } from './FavoriteJoinCreateManyProductInputSchema';

export const FavoriteJoinCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.FavoriteJoinCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FavoriteJoinCreateManyProductInputSchema),z.lazy(() => FavoriteJoinCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default FavoriteJoinCreateManyProductInputEnvelopeSchema;
