import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryCreateWithoutJrFindReplaceRejectsInputSchema';
import { StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.StoryCreateOrConnectWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => StoryCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema;
