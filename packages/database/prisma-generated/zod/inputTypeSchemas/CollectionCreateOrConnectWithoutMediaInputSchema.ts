import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutMediaInputSchema } from './CollectionCreateWithoutMediaInputSchema';
import { CollectionUncheckedCreateWithoutMediaInputSchema } from './CollectionUncheckedCreateWithoutMediaInputSchema';

export const CollectionCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutMediaInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutMediaInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutMediaInputSchema),
      ]),
    })
    .strict();

export default CollectionCreateOrConnectWithoutMediaInputSchema;
