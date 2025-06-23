import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutCastsInputSchema } from './JrFindReplaceRejectCreateWithoutCastsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutCastsInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutCastsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutCastsInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutCastsInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutCastsInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutCastsInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUncheckedUpdateManyWithoutCastsNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedUpdateManyWithoutCastsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateWithoutCastsInputSchema).array(),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutCastsInputSchema).array(),
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
          z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutCastsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutCastsInputSchema).array(),
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

export default JrFindReplaceRejectUncheckedUpdateManyWithoutCastsNestedInputSchema;
