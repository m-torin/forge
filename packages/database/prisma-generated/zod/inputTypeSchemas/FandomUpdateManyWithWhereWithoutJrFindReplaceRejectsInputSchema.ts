import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';
import { FandomUpdateManyMutationInputSchema } from './FandomUpdateManyMutationInputSchema';
import { FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema';

export const FandomUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.FandomUpdateManyWithWhereWithoutJrFindReplaceRejectsInput> = z.object({
  where: z.lazy(() => FandomScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FandomUpdateManyMutationInputSchema),z.lazy(() => FandomUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema) ]),
}).strict();

export default FandomUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema;
