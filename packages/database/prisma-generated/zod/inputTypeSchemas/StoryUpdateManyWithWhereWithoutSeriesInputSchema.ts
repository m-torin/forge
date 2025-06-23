import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';
import { StoryUpdateManyMutationInputSchema } from './StoryUpdateManyMutationInputSchema';
import { StoryUncheckedUpdateManyWithoutSeriesInputSchema } from './StoryUncheckedUpdateManyWithoutSeriesInputSchema';

export const StoryUpdateManyWithWhereWithoutSeriesInputSchema: z.ZodType<Prisma.StoryUpdateManyWithWhereWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => StoryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateManyMutationInputSchema),
        z.lazy(() => StoryUncheckedUpdateManyWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateManyWithWhereWithoutSeriesInputSchema;
