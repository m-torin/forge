import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';
import { StoryUpdateManyMutationInputSchema } from './StoryUpdateManyMutationInputSchema';
import { StoryUncheckedUpdateManyWithoutFandomInputSchema } from './StoryUncheckedUpdateManyWithoutFandomInputSchema';

export const StoryUpdateManyWithWhereWithoutFandomInputSchema: z.ZodType<Prisma.StoryUpdateManyWithWhereWithoutFandomInput> =
  z
    .object({
      where: z.lazy(() => StoryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateManyMutationInputSchema),
        z.lazy(() => StoryUncheckedUpdateManyWithoutFandomInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateManyWithWhereWithoutFandomInputSchema;
