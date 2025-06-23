import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesCreateWithoutDeletedByInputSchema } from './SeriesCreateWithoutDeletedByInputSchema';
import { SeriesUncheckedCreateWithoutDeletedByInputSchema } from './SeriesUncheckedCreateWithoutDeletedByInputSchema';

export const SeriesCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.SeriesCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutDeletedByInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default SeriesCreateOrConnectWithoutDeletedByInputSchema;
