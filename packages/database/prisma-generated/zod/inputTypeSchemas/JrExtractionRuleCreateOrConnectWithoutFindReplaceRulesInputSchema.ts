import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema';

export const JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema: z.ZodType<Prisma.JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInput> =
  z
    .object({
      where: z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema),
        z.lazy(() => JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema),
      ]),
    })
    .strict();

export default JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema;
