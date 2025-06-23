import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateWithoutPdpJoinsInputSchema } from './CollectionUpdateWithoutPdpJoinsInputSchema';
import { CollectionUncheckedUpdateWithoutPdpJoinsInputSchema } from './CollectionUncheckedUpdateWithoutPdpJoinsInputSchema';
import { CollectionCreateWithoutPdpJoinsInputSchema } from './CollectionCreateWithoutPdpJoinsInputSchema';
import { CollectionUncheckedCreateWithoutPdpJoinsInputSchema } from './CollectionUncheckedCreateWithoutPdpJoinsInputSchema';

export const CollectionUpsertWithWhereUniqueWithoutPdpJoinsInputSchema: z.ZodType<Prisma.CollectionUpsertWithWhereUniqueWithoutPdpJoinsInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CollectionUpdateWithoutPdpJoinsInputSchema),
        z.lazy(() => CollectionUncheckedUpdateWithoutPdpJoinsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutPdpJoinsInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutPdpJoinsInputSchema),
      ]),
    })
    .strict();

export default CollectionUpsertWithWhereUniqueWithoutPdpJoinsInputSchema;
