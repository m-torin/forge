import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateWithoutStoriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutStoriesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema;
