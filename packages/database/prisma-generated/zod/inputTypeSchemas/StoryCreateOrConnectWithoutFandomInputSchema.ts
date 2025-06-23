import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryCreateWithoutFandomInputSchema } from './StoryCreateWithoutFandomInputSchema';
import { StoryUncheckedCreateWithoutFandomInputSchema } from './StoryUncheckedCreateWithoutFandomInputSchema';

export const StoryCreateOrConnectWithoutFandomInputSchema: z.ZodType<Prisma.StoryCreateOrConnectWithoutFandomInput> =
  z
    .object({
      where: z.lazy(() => StoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => StoryCreateWithoutFandomInputSchema),
        z.lazy(() => StoryUncheckedCreateWithoutFandomInputSchema),
      ]),
    })
    .strict();

export default StoryCreateOrConnectWithoutFandomInputSchema;
