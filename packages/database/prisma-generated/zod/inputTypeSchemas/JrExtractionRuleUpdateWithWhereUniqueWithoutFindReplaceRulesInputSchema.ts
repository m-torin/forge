import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';
import { JrExtractionRuleUpdateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUpdateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUncheckedUpdateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedUpdateWithoutFindReplaceRulesInputSchema';

export const JrExtractionRuleUpdateWithWhereUniqueWithoutFindReplaceRulesInputSchema: z.ZodType<Prisma.JrExtractionRuleUpdateWithWhereUniqueWithoutFindReplaceRulesInput> = z.object({
  where: z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => JrExtractionRuleUpdateWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleUncheckedUpdateWithoutFindReplaceRulesInputSchema) ]),
}).strict();

export default JrExtractionRuleUpdateWithWhereUniqueWithoutFindReplaceRulesInputSchema;
