import type { Prisma } from '../../client';

import { z } from 'zod';
import { StoryCreateWithoutSeriesInputSchema } from './StoryCreateWithoutSeriesInputSchema';
import { StoryUncheckedCreateWithoutSeriesInputSchema } from './StoryUncheckedCreateWithoutSeriesInputSchema';
import { StoryCreateOrConnectWithoutSeriesInputSchema } from './StoryCreateOrConnectWithoutSeriesInputSchema';
import { StoryUpsertWithWhereUniqueWithoutSeriesInputSchema } from './StoryUpsertWithWhereUniqueWithoutSeriesInputSchema';
import { StoryCreateManySeriesInputEnvelopeSchema } from './StoryCreateManySeriesInputEnvelopeSchema';
import { StoryWhereUniqueInputSchema } from './StoryWhereUniqueInputSchema';
import { StoryUpdateWithWhereUniqueWithoutSeriesInputSchema } from './StoryUpdateWithWhereUniqueWithoutSeriesInputSchema';
import { StoryUpdateManyWithWhereWithoutSeriesInputSchema } from './StoryUpdateManyWithWhereWithoutSeriesInputSchema';
import { StoryScalarWhereInputSchema } from './StoryScalarWhereInputSchema';

export const StoryUpdateManyWithoutSeriesNestedInputSchema: z.ZodType<Prisma.StoryUpdateManyWithoutSeriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => StoryCreateWithoutSeriesInputSchema),
          z.lazy(() => StoryCreateWithoutSeriesInputSchema).array(),
          z.lazy(() => StoryUncheckedCreateWithoutSeriesInputSchema),
          z.lazy(() => StoryUncheckedCreateWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => StoryCreateOrConnectWithoutSeriesInputSchema),
          z.lazy(() => StoryCreateOrConnectWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutSeriesInputSchema),
          z.lazy(() => StoryUpsertWithWhereUniqueWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => StoryCreateManySeriesInputEnvelopeSchema).optional(),
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
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutSeriesInputSchema),
          z.lazy(() => StoryUpdateWithWhereUniqueWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => StoryUpdateManyWithWhereWithoutSeriesInputSchema),
          z.lazy(() => StoryUpdateManyWithWhereWithoutSeriesInputSchema).array(),
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

export default StoryUpdateManyWithoutSeriesNestedInputSchema;
