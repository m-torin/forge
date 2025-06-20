import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryCreateWithoutJrFindReplaceRejectsInputSchema';
import { StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';

export const StoryCreateNestedManyWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.StoryCreateNestedManyWithoutJrFindReplaceRejectsInput> = z.object({
  create: z.union([ z.lazy(() => StoryCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => StoryCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => StoryWhereUniqueInputSchema),z.lazy(() => StoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default StoryCreateNestedManyWithoutJrFindReplaceRejectsInputSchema;
