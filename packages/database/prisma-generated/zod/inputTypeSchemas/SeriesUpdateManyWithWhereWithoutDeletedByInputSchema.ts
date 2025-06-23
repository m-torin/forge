import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';
import { SeriesUpdateManyMutationInputSchema } from './SeriesUpdateManyMutationInputSchema';
import { SeriesUncheckedUpdateManyWithoutDeletedByInputSchema } from './SeriesUncheckedUpdateManyWithoutDeletedByInputSchema';

export const SeriesUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.SeriesUpdateManyWithWhereWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => SeriesScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => SeriesUpdateManyMutationInputSchema),
        z.lazy(() => SeriesUncheckedUpdateManyWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default SeriesUpdateManyWithWhereWithoutDeletedByInputSchema;
