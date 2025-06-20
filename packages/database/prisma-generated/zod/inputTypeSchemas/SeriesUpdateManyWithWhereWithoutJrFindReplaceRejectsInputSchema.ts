import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';
import { SeriesUpdateManyMutationInputSchema } from './SeriesUpdateManyMutationInputSchema';
import { SeriesUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema';

export const SeriesUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.SeriesUpdateManyWithWhereWithoutJrFindReplaceRejectsInput> = z.object({
  where: z.lazy(() => SeriesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => SeriesUpdateManyMutationInputSchema),z.lazy(() => SeriesUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema) ]),
}).strict();

export default SeriesUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema;
