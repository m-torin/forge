import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastScalarWhereInputSchema } from './CastScalarWhereInputSchema';
import { CastUpdateManyMutationInputSchema } from './CastUpdateManyMutationInputSchema';
import { CastUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema';

export const CastUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.CastUpdateManyWithWhereWithoutJrFindReplaceRejectsInput> = z.object({
  where: z.lazy(() => CastScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CastUpdateManyMutationInputSchema),z.lazy(() => CastUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema) ]),
}).strict();

export default CastUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema;
