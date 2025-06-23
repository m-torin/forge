import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutDeletedByInputSchema } from './SeriesCreateWithoutDeletedByInputSchema';
import { SeriesUncheckedCreateWithoutDeletedByInputSchema } from './SeriesUncheckedCreateWithoutDeletedByInputSchema';
import { SeriesCreateOrConnectWithoutDeletedByInputSchema } from './SeriesCreateOrConnectWithoutDeletedByInputSchema';
import { SeriesCreateManyDeletedByInputEnvelopeSchema } from './SeriesCreateManyDeletedByInputEnvelopeSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';

export const SeriesCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.SeriesCreateNestedManyWithoutDeletedByInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => SeriesCreateWithoutDeletedByInputSchema),
          z.lazy(() => SeriesCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => SeriesUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => SeriesUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => SeriesCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => SeriesCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => SeriesCreateManyDeletedByInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => SeriesWhereUniqueInputSchema),
          z.lazy(() => SeriesWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default SeriesCreateNestedManyWithoutDeletedByInputSchema;
