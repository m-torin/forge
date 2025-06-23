import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryCreateWithoutSeriesInputSchema } from './StoryCreateWithoutSeriesInputSchema';
import { StoryUncheckedCreateWithoutSeriesInputSchema } from './StoryUncheckedCreateWithoutSeriesInputSchema';

export const StoryCreateOrConnectWithoutSeriesInputSchema: z.ZodType<Prisma.StoryCreateOrConnectWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => StoryCreateWithoutSeriesInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default StoryCreateOrConnectWithoutSeriesInputSchema;
