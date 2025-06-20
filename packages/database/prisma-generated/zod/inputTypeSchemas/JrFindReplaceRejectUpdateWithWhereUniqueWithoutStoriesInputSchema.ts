import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutStoriesInputSchema } from './JrFindReplaceRejectUpdateWithoutStoriesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutStoriesInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutStoriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutStoriesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutStoriesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutStoriesInputSchema;
