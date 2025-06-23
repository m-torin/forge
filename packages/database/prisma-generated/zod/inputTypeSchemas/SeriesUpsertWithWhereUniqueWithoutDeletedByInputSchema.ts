import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutDeletedByInputSchema } from './SeriesUpdateWithoutDeletedByInputSchema';
import { SeriesUncheckedUpdateWithoutDeletedByInputSchema } from './SeriesUncheckedUpdateWithoutDeletedByInputSchema';
import { SeriesCreateWithoutDeletedByInputSchema } from './SeriesCreateWithoutDeletedByInputSchema';
import { SeriesUncheckedCreateWithoutDeletedByInputSchema } from './SeriesUncheckedCreateWithoutDeletedByInputSchema';

export const SeriesUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.SeriesUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => SeriesUpdateWithoutDeletedByInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutDeletedByInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default SeriesUpsertWithWhereUniqueWithoutDeletedByInputSchema;
