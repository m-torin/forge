import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutJrFindReplaceRejectsInputSchema } from './StoryUpdateWithoutJrFindReplaceRejectsInputSchema';
import { StoryUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';
import { StoryCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryCreateWithoutJrFindReplaceRejectsInputSchema';
import { StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const StoryUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.StoryUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => StoryUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => StoryCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default StoryUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
