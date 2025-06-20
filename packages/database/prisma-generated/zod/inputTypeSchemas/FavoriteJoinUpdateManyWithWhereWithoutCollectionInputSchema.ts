import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinScalarWhereInputSchema } from './FavoriteJoinScalarWhereInputSchema';
import { FavoriteJoinUpdateManyMutationInputSchema } from './FavoriteJoinUpdateManyMutationInputSchema';
import { FavoriteJoinUncheckedUpdateManyWithoutCollectionInputSchema } from './FavoriteJoinUncheckedUpdateManyWithoutCollectionInputSchema';

export const FavoriteJoinUpdateManyWithWhereWithoutCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateManyWithWhereWithoutCollectionInput> = z.object({
  where: z.lazy(() => FavoriteJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoriteJoinUpdateManyMutationInputSchema),z.lazy(() => FavoriteJoinUncheckedUpdateManyWithoutCollectionInputSchema) ]),
}).strict();

export default FavoriteJoinUpdateManyWithWhereWithoutCollectionInputSchema;
