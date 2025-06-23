import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutProductsInputSchema } from './StoryCreateWithoutProductsInputSchema';
import { StoryUncheckedCreateWithoutProductsInputSchema } from './StoryUncheckedCreateWithoutProductsInputSchema';
import { StoryCreateOrConnectWithoutProductsInputSchema } from './StoryCreateOrConnectWithoutProductsInputSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';

export const StoryUncheckedCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.StoryUncheckedCreateNestedManyWithoutProductsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => StoryCreateWithoutProductsInputSchema),
          z.lazy(() => StoryCreateWithoutProductsInputSchema).array(),
          z.lazy(() => StoryUncheckedCreateWithoutProductsInputSchema),
          z.lazy(() => StoryUncheckedCreateWithoutProductsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => StoryCreateOrConnectWithoutProductsInputSchema),
          z.lazy(() => StoryCreateOrConnectWithoutProductsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default StoryUncheckedCreateNestedManyWithoutProductsInputSchema;
