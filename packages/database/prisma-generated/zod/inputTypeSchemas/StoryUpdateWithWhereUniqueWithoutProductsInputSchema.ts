import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutProductsInputSchema } from './StoryUpdateWithoutProductsInputSchema';
import { StoryUncheckedUpdateWithoutProductsInputSchema } from './StoryUncheckedUpdateWithoutProductsInputSchema';

export const StoryUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.StoryUpdateWithWhereUniqueWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => StoryUpdateWithoutProductsInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default StoryUpdateWithWhereUniqueWithoutProductsInputSchema;
