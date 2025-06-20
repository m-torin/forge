import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinCreateManyCollectionInputSchema } from './FavoriteJoinCreateManyCollectionInputSchema';

export const FavoriteJoinCreateManyCollectionInputEnvelopeSchema: z.ZodType<Prisma.FavoriteJoinCreateManyCollectionInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => FavoriteJoinCreateManyCollectionInputSchema),z.lazy(() => FavoriteJoinCreateManyCollectionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default FavoriteJoinCreateManyCollectionInputEnvelopeSchema;
