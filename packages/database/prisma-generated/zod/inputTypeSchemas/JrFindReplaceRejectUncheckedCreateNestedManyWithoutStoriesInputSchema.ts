import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateWithoutStoriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectUncheckedCreateNestedManyWithoutStoriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedCreateNestedManyWithoutStoriesInput> = z.object({
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectCreateWithoutStoriesInputSchema).array(),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema),z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutStoriesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default JrFindReplaceRejectUncheckedCreateNestedManyWithoutStoriesInputSchema;
