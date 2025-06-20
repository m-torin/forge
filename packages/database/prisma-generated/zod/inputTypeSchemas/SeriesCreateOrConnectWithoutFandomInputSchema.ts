import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesCreateWithoutFandomInputSchema } from './SeriesCreateWithoutFandomInputSchema';
import { SeriesUncheckedCreateWithoutFandomInputSchema } from './SeriesUncheckedCreateWithoutFandomInputSchema';

export const SeriesCreateOrConnectWithoutFandomInputSchema: z.ZodType<Prisma.SeriesCreateOrConnectWithoutFandomInput> = z.object({
  where: z.lazy(() => SeriesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => SeriesCreateWithoutFandomInputSchema),z.lazy(() => SeriesUncheckedCreateWithoutFandomInputSchema) ]),
}).strict();

export default SeriesCreateOrConnectWithoutFandomInputSchema;
