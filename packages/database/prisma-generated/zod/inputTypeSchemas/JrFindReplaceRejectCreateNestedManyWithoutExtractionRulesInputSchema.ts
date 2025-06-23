import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectCreateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutExtractionRulesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectCreateNestedManyWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateNestedManyWithoutExtractionRulesInput> =
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
      connect: z
        .union([
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default JrFindReplaceRejectCreateNestedManyWithoutExtractionRulesInputSchema;
