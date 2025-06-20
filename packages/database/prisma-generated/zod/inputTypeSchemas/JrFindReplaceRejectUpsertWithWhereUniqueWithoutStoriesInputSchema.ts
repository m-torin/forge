import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutStoriesInputSchema } from './JrFindReplaceRejectUpdateWithoutStoriesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutStoriesInputSchema';
import { JrFindReplaceRejectCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateWithoutStoriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutStoriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutStoriesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutStoriesInputSchema) ]),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutStoriesInputSchema;
