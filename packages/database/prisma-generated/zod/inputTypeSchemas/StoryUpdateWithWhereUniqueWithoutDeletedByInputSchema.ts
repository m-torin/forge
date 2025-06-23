import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutDeletedByInputSchema } from './StoryUpdateWithoutDeletedByInputSchema';
import { StoryUncheckedUpdateWithoutDeletedByInputSchema } from './StoryUncheckedUpdateWithoutDeletedByInputSchema';

export const StoryUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.StoryUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateWithoutDeletedByInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateWithWhereUniqueWithoutDeletedByInputSchema;
