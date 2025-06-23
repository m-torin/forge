import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutJrFindReplaceRejectsInputSchema } from './StoryUpdateWithoutJrFindReplaceRejectsInputSchema';
import { StoryUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';

export const StoryUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.StoryUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
