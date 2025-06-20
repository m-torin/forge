import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinScalarWhereInputSchema } from './FavoriteJoinScalarWhereInputSchema';
import { FavoriteJoinUpdateManyMutationInputSchema } from './FavoriteJoinUpdateManyMutationInputSchema';
import { FavoriteJoinUncheckedUpdateManyWithoutProductInputSchema } from './FavoriteJoinUncheckedUpdateManyWithoutProductInputSchema';

export const FavoriteJoinUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateManyWithWhereWithoutProductInput> = z.object({
  where: z.lazy(() => FavoriteJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoriteJoinUpdateManyMutationInputSchema),z.lazy(() => FavoriteJoinUncheckedUpdateManyWithoutProductInputSchema) ]),
}).strict();

export default FavoriteJoinUpdateManyWithWhereWithoutProductInputSchema;
