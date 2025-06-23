import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionCreateWithoutBrandsInputSchema } from './CollectionCreateWithoutBrandsInputSchema';
import { CollectionUncheckedCreateWithoutBrandsInputSchema } from './CollectionUncheckedCreateWithoutBrandsInputSchema';

export const CollectionCreateOrConnectWithoutBrandsInputSchema: z.ZodType<Prisma.CollectionCreateOrConnectWithoutBrandsInput> =
  z
    .object({
      where: z.lazy(() => CollectionWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CollectionCreateWithoutBrandsInputSchema),
        z.lazy(() => CollectionUncheckedCreateWithoutBrandsInputSchema),
      ]),
    })
    .strict();

export default CollectionCreateOrConnectWithoutBrandsInputSchema;
