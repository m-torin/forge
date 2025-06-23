import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';
import { SeriesUpdateManyMutationInputSchema } from './SeriesUpdateManyMutationInputSchema';
import { SeriesUncheckedUpdateManyWithoutFandomInputSchema } from './SeriesUncheckedUpdateManyWithoutFandomInputSchema';

export const SeriesUpdateManyWithWhereWithoutFandomInputSchema: z.ZodType<Prisma.SeriesUpdateManyWithWhereWithoutFandomInput> =
  z
    .object({
      where: z.lazy(() => SeriesScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => SeriesUpdateManyMutationInputSchema),
        z.lazy(() => SeriesUncheckedUpdateManyWithoutFandomInputSchema),
      ]),
    })
    .strict();

export default SeriesUpdateManyWithWhereWithoutFandomInputSchema;
