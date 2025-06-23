import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutDeletedByInputSchema } from './CollectionCreateWithoutDeletedByInputSchema';
import { CollectionUncheckedCreateWithoutDeletedByInputSchema } from './CollectionUncheckedCreateWithoutDeletedByInputSchema';
import { CollectionCreateOrConnectWithoutDeletedByInputSchema } from './CollectionCreateOrConnectWithoutDeletedByInputSchema';
import { CollectionCreateManyDeletedByInputEnvelopeSchema } from './CollectionCreateManyDeletedByInputEnvelopeSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.CollectionCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CollectionCreateWithoutDeletedByInputSchema),
          z.lazy(() => CollectionCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => CollectionUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => CollectionUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CollectionCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => CollectionCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => CollectionCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => CollectionWhereUniqueInputSchema),
          z.lazy(() => CollectionWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CollectionCreateNestedManyWithoutDeletedByInputSchema;
