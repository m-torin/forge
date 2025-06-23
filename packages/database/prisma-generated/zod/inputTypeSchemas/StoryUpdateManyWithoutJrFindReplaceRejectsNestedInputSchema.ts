import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryCreateWithoutJrFindReplaceRejectsInputSchema';
import { StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { StoryUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './StoryUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './StoryUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { StoryUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema } from './StoryUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';

export const StoryUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema: z.ZodType<Prisma.StoryUpdateManyWithoutJrFindReplaceRejectsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => StoryCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => StoryCreateWithoutJrFindReplaceRejectsInputSchema).array(),
          z.lazy(() => StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => StoryUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => StoryCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
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
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => StoryUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => StoryUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema).array(),
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

export default StoryUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema;
