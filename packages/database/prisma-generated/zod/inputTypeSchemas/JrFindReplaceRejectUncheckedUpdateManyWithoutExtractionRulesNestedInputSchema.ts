import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUpsertWithWhereUniqueWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUpsertWithWhereUniqueWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithWhereUniqueWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUpdateWithWhereUniqueWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUpdateManyWithWhereWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUpdateManyWithWhereWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectScalarWhereInputSchema } from './JrFindReplaceRejectScalarWhereInputSchema';

export const JrFindReplaceRejectUncheckedUpdateManyWithoutExtractionRulesNestedInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedUpdateManyWithoutExtractionRulesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema).array(),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutExtractionRulesInputSchema),
          z
            .lazy(() => JrFindReplaceRejectUpsertWithWhereUniqueWithoutExtractionRulesInputSchema)
            .array(),
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
          z.lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutExtractionRulesInputSchema),
          z
            .lazy(() => JrFindReplaceRejectUpdateWithWhereUniqueWithoutExtractionRulesInputSchema)
            .array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutExtractionRulesInputSchema),
          z
            .lazy(() => JrFindReplaceRejectUpdateManyWithWhereWithoutExtractionRulesInputSchema)
            .array(),
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

export default JrFindReplaceRejectUncheckedUpdateManyWithoutExtractionRulesNestedInputSchema;
