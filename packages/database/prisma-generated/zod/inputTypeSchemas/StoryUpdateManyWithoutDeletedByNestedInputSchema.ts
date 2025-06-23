import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutDeletedByInputSchema } from './StoryCreateWithoutDeletedByInputSchema';
import { StoryUncheckedCreateWithoutDeletedByInputSchema } from './StoryUncheckedCreateWithoutDeletedByInputSchema';
import { StoryCreateOrConnectWithoutDeletedByInputSchema } from './StoryCreateOrConnectWithoutDeletedByInputSchema';
import { StoryUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './StoryUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { StoryCreateManyDeletedByInputEnvelopeSchema } from './StoryCreateManyDeletedByInputEnvelopeSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './StoryUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { StoryUpdateManyWithWhereWithoutDeletedByInputSchema } from './StoryUpdateManyWithWhereWithoutDeletedByInputSchema';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';

export const StoryUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.StoryUpdateManyWithoutDeletedByNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => StoryCreateWithoutDeletedByInputSchema),
          z.lazy(() => StoryCreateWithoutDeletedByInputSchema).array(),
          z.lazy(() => StoryUncheckedCreateWithoutDeletedByInputSchema),
          z.lazy(() => StoryUncheckedCreateWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => StoryCreateOrConnectWithoutDeletedByInputSchema),
          z.lazy(() => StoryCreateOrConnectWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => StoryCreateManyDeletedByInputEnvelopeSchema).optional(),
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
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutDeletedByInputSchema),
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutDeletedByInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => StoryUpdateManyWithWhereWithoutDeletedByInputSchema),
          z.lazy(() => StoryUpdateManyWithWhereWithoutDeletedByInputSchema).array(),
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

export default StoryUpdateManyWithoutDeletedByNestedInputSchema;
