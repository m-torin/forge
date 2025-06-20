import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';
import { JrFindReplaceRejectUpdateManyMutationInputSchema } from './JrFindReplaceRejectUpdateManyMutationInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutStoriesInputSchema';

export const JrFindReplaceRejectUpdateManyWithWhereWithoutStoriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithWhereWithoutStoriesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateManyMutationInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutStoriesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateManyWithWhereWithoutStoriesInputSchema;
