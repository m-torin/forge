import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutParentInputSchema } from './CollectionCreateWithoutParentInputSchema';
import { CollectionUncheckedCreateWithoutParentInputSchema } from './CollectionUncheckedCreateWithoutParentInputSchema';
import { CollectionCreateOrConnectWithoutParentInputSchema } from './CollectionCreateOrConnectWithoutParentInputSchema';
import { CollectionCreateManyParentInputEnvelopeSchema } from './CollectionCreateManyParentInputEnvelopeSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionUncheckedCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.CollectionUncheckedCreateNestedManyWithoutParentInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutParentInputSchema),
          z.lazy(() => CollectionCreateWithoutParentInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutParentInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutParentInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutParentInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutParentInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => CollectionCreateManyParentInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CollectionUncheckedCreateNestedManyWithoutParentInputSchema;
