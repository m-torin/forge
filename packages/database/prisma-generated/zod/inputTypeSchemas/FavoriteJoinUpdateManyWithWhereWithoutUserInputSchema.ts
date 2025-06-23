import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinScalarWhereInputSchema } from './FavoriteJoinScalarWhereInputSchema';
import { FavoriteJoinUpdateManyMutationInputSchema } from './FavoriteJoinUpdateManyMutationInputSchema';
import { FavoriteJoinUncheckedUpdateManyWithoutUserInputSchema } from './FavoriteJoinUncheckedUpdateManyWithoutUserInputSchema';

export const FavoriteJoinUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateManyWithWhereWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => FavoriteJoinScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => FavoriteJoinUpdateManyMutationInputSchema),
        z.lazy(() => FavoriteJoinUncheckedUpdateManyWithoutUserInputSchema),
      ]),
    })
    .strict();

export default FavoriteJoinUpdateManyWithWhereWithoutUserInputSchema;
