import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryCreateWithoutProductsInputSchema } from './StoryCreateWithoutProductsInputSchema';
import { StoryUncheckedCreateWithoutProductsInputSchema } from './StoryUncheckedCreateWithoutProductsInputSchema';

export const StoryCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.StoryCreateOrConnectWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => StoryCreateWithoutProductsInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default StoryCreateOrConnectWithoutProductsInputSchema;
