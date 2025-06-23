import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutDeletedByInputSchema } from './StoryUpdateWithoutDeletedByInputSchema';
import { StoryUncheckedUpdateWithoutDeletedByInputSchema } from './StoryUncheckedUpdateWithoutDeletedByInputSchema';
import { StoryCreateWithoutDeletedByInputSchema } from './StoryCreateWithoutDeletedByInputSchema';
import { StoryUncheckedCreateWithoutDeletedByInputSchema } from './StoryUncheckedCreateWithoutDeletedByInputSchema';

export const StoryUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.StoryUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => StoryUpdateWithoutDeletedByInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => StoryCreateWithoutDeletedByInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default StoryUpsertWithWhereUniqueWithoutDeletedByInputSchema;
