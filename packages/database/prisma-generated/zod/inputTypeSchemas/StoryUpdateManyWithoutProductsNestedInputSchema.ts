import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutProductsInputSchema } from './StoryCreateWithoutProductsInputSchema';
import { StoryUncheckedCreateWithoutProductsInputSchema } from './StoryUncheckedCreateWithoutProductsInputSchema';
import { StoryCreateOrConnectWithoutProductsInputSchema } from './StoryCreateOrConnectWithoutProductsInputSchema';
import { StoryUpsertWithWhereUniqueWithoutProductsInputSchema } from './StoryUpsertWithWhereUniqueWithoutProductsInputSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithWhereUniqueWithoutProductsInputSchema } from './StoryUpdateWithWhereUniqueWithoutProductsInputSchema';
import { StoryUpdateManyWithWhereWithoutProductsInputSchema } from './StoryUpdateManyWithWhereWithoutProductsInputSchema';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';

export const StoryUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.StoryUpdateManyWithoutProductsNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutProductsInputSchema),
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutProductsInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => StoryWhereUniqueInputSchema),
          z.lazy(() => StoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutProductsInputSchema),
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutProductsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => StoryUpdateManyWithWhereWithoutProductsInputSchema),
          z.lazy(() => StoryUpdateManyWithWhereWithoutProductsInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => StoryScalarWhereInputSchema),
          z.lazy(() => StoryScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default StoryUpdateManyWithoutProductsNestedInputSchema;
