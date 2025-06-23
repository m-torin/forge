import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutFandomInputSchema } from './StoryUpdateWithoutFandomInputSchema';
import { StoryUncheckedUpdateWithoutFandomInputSchema } from './StoryUncheckedUpdateWithoutFandomInputSchema';

export const StoryUpdateWithWhereUniqueWithoutFandomInputSchema: z.ZodType<Prisma.StoryUpdateWithWhereUniqueWithoutFandomInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateWithoutFandomInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutFandomInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateWithWhereUniqueWithoutFandomInputSchema;
