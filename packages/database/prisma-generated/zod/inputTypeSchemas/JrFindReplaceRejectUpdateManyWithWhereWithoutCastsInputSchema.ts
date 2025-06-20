import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutCastsInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutCastsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutCastsInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutCastsInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutCastsInputSchema;
