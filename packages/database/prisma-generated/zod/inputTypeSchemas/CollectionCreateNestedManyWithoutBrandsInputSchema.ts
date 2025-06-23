import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutBrandsInputSchema } from './CollectionCreateWithoutBrandsInputSchema';
import { CollectionUncheckedCreateWithoutBrandsInputSchema } from './CollectionUncheckedCreateWithoutBrandsInputSchema';
import { CollectionCreateOrConnectWithoutBrandsInputSchema } from './CollectionCreateOrConnectWithoutBrandsInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedManyWithoutBrandsInputSchema: z.ZodType<Prisma.CollectionCreateNestedManyWithoutBrandsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutBrandsInputSchema),
          z.lazy(() => CollectionCreateWithoutBrandsInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutBrandsInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutBrandsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutBrandsInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutBrandsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CollectionCreateNestedManyWithoutBrandsInputSchema;
