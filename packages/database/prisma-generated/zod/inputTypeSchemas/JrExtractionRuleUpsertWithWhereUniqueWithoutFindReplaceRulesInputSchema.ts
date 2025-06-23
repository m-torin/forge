import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleUpdateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUpdateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUncheckedUpdateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedUpdateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema';

export const JrExtractionRuleUpsertWithWhereUniqueWithoutFindReplaceRulesInputSchema: z.ZodType<Prisma.JrExtractionRuleUpsertWithWhereUniqueWithoutFindReplaceRulesInput> =
  z
    .object({
      where: z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => JrExtractionRuleUpdateWithoutFindReplaceRulesInputSchema),
        z.lazy(() => JrExtractionRuleUncheckedUpdateWithoutFindReplaceRulesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema),
        z.lazy(() => JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema),
      ]),
    })
    .strict();

export default JrExtractionRuleUpsertWithWhereUniqueWithoutFindReplaceRulesInputSchema;
