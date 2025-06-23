import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutSeriesInputSchema } from './StoryUpdateWithoutSeriesInputSchema';
import { StoryUncheckedUpdateWithoutSeriesInputSchema } from './StoryUncheckedUpdateWithoutSeriesInputSchema';

export const StoryUpdateWithWhereUniqueWithoutSeriesInputSchema: z.ZodType<Prisma.StoryUpdateWithWhereUniqueWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateWithoutSeriesInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateWithWhereUniqueWithoutSeriesInputSchema;
