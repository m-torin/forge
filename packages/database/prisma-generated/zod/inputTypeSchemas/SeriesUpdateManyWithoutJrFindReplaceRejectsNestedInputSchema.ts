import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesCreateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './SeriesUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { SeriesWhereUniqueInputSchema } from './SeriesWhereUniqueInputSchema';
import { SeriesUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema } from './SeriesUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema } from './SeriesUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema';
import { SeriesScalarWhereInputSchema } from './SeriesScalarWhereInputSchema';

export const SeriesUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema: z.ZodType<Prisma.SeriesUpdateManyWithoutJrFindReplaceRejectsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => SeriesCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => SeriesCreateWithoutJrFindReplaceRejectsInputSchema).array(),
          z.lazy(() => SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => SeriesUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => SeriesCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => SeriesUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => SeriesUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => SeriesWhereUniqueInputSchema),
          z.lazy(() => SeriesWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => SeriesWhereUniqueInputSchema),
          z.lazy(() => SeriesWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => SeriesWhereUniqueInputSchema),
          z.lazy(() => SeriesWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => SeriesWhereUniqueInputSchema),
          z.lazy(() => SeriesWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => SeriesUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => SeriesUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => SeriesUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => SeriesUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => SeriesScalarWhereInputSchema),
          z.lazy(() => SeriesScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default SeriesUpdateManyWithoutJrFindReplaceRejectsNestedInputSchema;
