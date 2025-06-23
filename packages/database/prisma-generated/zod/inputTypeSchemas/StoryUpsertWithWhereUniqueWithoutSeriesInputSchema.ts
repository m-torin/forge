import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutSeriesInputSchema } from './StoryUpdateWithoutSeriesInputSchema';
import { StoryUncheckedUpdateWithoutSeriesInputSchema } from './StoryUncheckedUpdateWithoutSeriesInputSchema';
import { StoryCreateWithoutSeriesInputSchema } from './StoryCreateWithoutSeriesInputSchema';
import { StoryUncheckedCreateWithoutSeriesInputSchema } from './StoryUncheckedCreateWithoutSeriesInputSchema';

export const StoryUpsertWithWhereUniqueWithoutSeriesInputSchema: z.ZodType<Prisma.StoryUpsertWithWhereUniqueWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => StoryUpdateWithoutSeriesInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutSeriesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => StoryCreateWithoutSeriesInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default StoryUpsertWithWhereUniqueWithoutSeriesInputSchema;
