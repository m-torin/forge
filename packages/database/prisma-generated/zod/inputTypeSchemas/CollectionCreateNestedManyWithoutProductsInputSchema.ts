import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutProductsInputSchema } from './CollectionCreateWithoutProductsInputSchema';
import { CollectionUncheckedCreateWithoutProductsInputSchema } from './CollectionUncheckedCreateWithoutProductsInputSchema';
import { CollectionCreateOrConnectWithoutProductsInputSchema } from './CollectionCreateOrConnectWithoutProductsInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.CollectionCreateNestedManyWithoutProductsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutProductsInputSchema),
          z.lazy(() => CollectionCreateWithoutProductsInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutProductsInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutProductsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutProductsInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutProductsInputSchema).array(),
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

export default CollectionCreateNestedManyWithoutProductsInputSchema;
