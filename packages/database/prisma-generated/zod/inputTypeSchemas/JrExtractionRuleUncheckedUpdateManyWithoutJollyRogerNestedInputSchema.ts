import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleCreateWithoutJollyRogerInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema';
import { JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema } from './JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema';
import { JrExtractionRuleUpsertWithWhereUniqueWithoutJollyRogerInputSchema } from './JrExtractionRuleUpsertWithWhereUniqueWithoutJollyRogerInputSchema';
import { JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema } from './JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleUpdateWithWhereUniqueWithoutJollyRogerInputSchema } from './JrExtractionRuleUpdateWithWhereUniqueWithoutJollyRogerInputSchema';
import { JrExtractionRuleUpdateManyWithWhereWithoutJollyRogerInputSchema } from './JrExtractionRuleUpdateManyWithWhereWithoutJollyRogerInputSchema';
import { JrExtractionRuleScalarWhereInputSchema } from './JrExtractionRuleScalarWhereInputSchema';

export const JrExtractionRuleUncheckedUpdateManyWithoutJollyRogerNestedInputSchema: z.ZodType<Prisma.JrExtractionRuleUncheckedUpdateManyWithoutJollyRogerNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrExtractionRuleCreateWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleCreateWithoutJollyRogerInputSchema).array(),
          z.lazy(() => JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleUncheckedCreateWithoutJollyRogerInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleCreateOrConnectWithoutJollyRogerInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => JrExtractionRuleUpsertWithWhereUniqueWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleUpsertWithWhereUniqueWithoutJollyRogerInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => JrExtractionRuleCreateManyJollyRogerInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
          z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => JrExtractionRuleUpdateWithWhereUniqueWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleUpdateWithWhereUniqueWithoutJollyRogerInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => JrExtractionRuleUpdateManyWithWhereWithoutJollyRogerInputSchema),
          z.lazy(() => JrExtractionRuleUpdateManyWithWhereWithoutJollyRogerInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => JrExtractionRuleScalarWhereInputSchema),
          z.lazy(() => JrExtractionRuleScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default JrExtractionRuleUncheckedUpdateManyWithoutJollyRogerNestedInputSchema;
