import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';
import { StoryUpdateManyMutationInputSchema } from './StoryUpdateManyMutationInputSchema';
import { StoryUncheckedUpdateManyWithoutDeletedByInputSchema } from './StoryUncheckedUpdateManyWithoutDeletedByInputSchema';

export const StoryUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.StoryUpdateManyWithWhereWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => StoryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateManyMutationInputSchema),
        z.lazy(() => StoryUncheckedUpdateManyWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateManyWithWhereWithoutDeletedByInputSchema;
