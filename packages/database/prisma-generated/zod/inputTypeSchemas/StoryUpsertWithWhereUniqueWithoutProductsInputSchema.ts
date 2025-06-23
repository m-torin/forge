import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithoutProductsInputSchema } from './StoryUpdateWithoutProductsInputSchema';
import { StoryUncheckedUpdateWithoutProductsInputSchema } from './StoryUncheckedUpdateWithoutProductsInputSchema';
import { StoryCreateWithoutProductsInputSchema } from './StoryCreateWithoutProductsInputSchema';
import { StoryUncheckedCreateWithoutProductsInputSchema } from './StoryUncheckedCreateWithoutProductsInputSchema';

export const StoryUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.StoryUpsertWithWhereUniqueWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => StoryUpdateWithoutProductsInputSchema),
        z.lazy(() => StoryUncheckedUpdateWithoutProductsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => StoryCreateWithoutProductsInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default StoryUpsertWithWhereUniqueWithoutProductsInputSchema;
