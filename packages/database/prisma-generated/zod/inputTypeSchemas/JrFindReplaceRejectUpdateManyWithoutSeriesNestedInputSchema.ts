import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectCreateWithoutSeriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutSeriesInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutSeriesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutSeriesInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutSeriesInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutSeriesInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutSeriesInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUpdateManyWithoutSeriesNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateManyWithoutSeriesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateWithoutSeriesInputSchema).array(),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema),
          z.lazy(() => JrFindReplaceRejectScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default JrFindReplaceRejectUpdateManyWithoutSeriesNestedInputSchema;
