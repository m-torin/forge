import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryCreateWithoutDeletedByInputSchema } from './StoryCreateWithoutDeletedByInputSchema';
import { StoryUncheckedCreateWithoutDeletedByInputSchema } from './StoryUncheckedCreateWithoutDeletedByInputSchema';

export const StoryCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.StoryCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => StoryCreateWithoutDeletedByInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default StoryCreateOrConnectWithoutDeletedByInputSchema;
