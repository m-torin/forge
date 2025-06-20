import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';
import { SeriesUpdateManyMutationInputSchema } from './SeriesUpdateManyMutationInputSchema';
import { SeriesUncheckedUpdateManyWithoutProductsInputSchema } from './SeriesUncheckedUpdateManyWithoutProductsInputSchema';

export const SeriesUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.SeriesUpdateManyWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => SeriesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SeriesUpdateManyMutationInputSchema),z.lazy(() => SeriesUncheckedUpdateManyWithoutProductsInputSchema) ]),
}).strict();

export default SeriesUpdateManyWithWhereWithoutProductsInputSchema;
