import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';
import { StoryUpdateManyMutationInputSchema } from './StoryUpdateManyMutationInputSchema';
import { StoryUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema';

export const StoryUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.StoryUpdateManyWithWhereWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => StoryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateManyMutationInputSchema),
        z.lazy(() => StoryUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema;
