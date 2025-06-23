import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesCreateWithoutProductsInputSchema } from './SeriesCreateWithoutProductsInputSchema';
import { SeriesUncheckedCreateWithoutProductsInputSchema } from './SeriesUncheckedCreateWithoutProductsInputSchema';

export const SeriesCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.SeriesCreateOrConnectWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => SeriesWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => SeriesCreateWithoutProductsInputSchema),
        z.lazy(() => SeriesUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default SeriesCreateOrConnectWithoutProductsInputSchema;
