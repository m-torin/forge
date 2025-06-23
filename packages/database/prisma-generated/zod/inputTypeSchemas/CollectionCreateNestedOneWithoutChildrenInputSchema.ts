import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutChildrenInputSchema } from './CollectionCreateWithoutChildrenInputSchema';
import { CollectionUncheckedCreateWithoutChildrenInputSchema } from './CollectionUncheckedCreateWithoutChildrenInputSchema';
import { CollectionCreateOrConnectWithoutChildrenInputSchema } from './CollectionCreateOrConnectWithoutChildrenInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedOneWithoutChildrenInputSchema: z.ZodType<Prisma.CollectionCreateNestedOneWithoutChildrenInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutChildrenInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutChildrenInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => CollectionCreateOrConnectWithoutChildrenInputSchema).optional(),
      connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
    })
    .strict();

export default CollectionCreateNestedOneWithoutChildrenInputSchema;
