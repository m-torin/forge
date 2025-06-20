import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutSeriesInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutSeriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutSeriesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutSeriesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutSeriesInputSchema;
