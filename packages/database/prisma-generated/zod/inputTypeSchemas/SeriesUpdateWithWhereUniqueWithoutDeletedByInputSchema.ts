import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithoutDeletedByInputSchema } from './SeriesUpdateWithoutDeletedByInputSchema';
import { SeriesUncheckedUpdateWithoutDeletedByInputSchema } from './SeriesUncheckedUpdateWithoutDeletedByInputSchema';

export const SeriesUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.SeriesUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => SeriesUpdateWithoutDeletedByInputSchema),
        z.lazy(() => SeriesUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default SeriesUpdateWithWhereUniqueWithoutDeletedByInputSchema;
