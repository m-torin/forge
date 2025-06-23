import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutUserInputSchema } from './CollectionUpdateWithoutUserInputSchema';
import { CollectionUncheckedUpdateWithoutUserInputSchema } from './CollectionUncheckedUpdateWithoutUserInputSchema';

export const CollectionUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CollectionUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CollectionUpdateWithoutUserInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default CollectionUpdateWithWhereUniqueWithoutUserInputSchema;
