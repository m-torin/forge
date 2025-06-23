import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleScalarWhereInputSchema } from './JrExtractionRuleScalarWhereInputSchema';
import { JrExtractionRuleUpdateManyMutationInputSchema } from './JrExtractionRuleUpdateManyMutationInputSchema';
import { JrExtractionRuleUncheckedUpdateManyWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedUpdateManyWithoutFindReplaceRulesInputSchema';

export const JrExtractionRuleUpdateManyWithWhereWithoutFindReplaceRulesInputSchema: z.ZodType<Prisma.JrExtractionRuleUpdateManyWithWhereWithoutFindReplaceRulesInput> =
  z
    .object({
      where: z.lazy(() => JrExtractionRuleScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => JrExtractionRuleUpdateManyMutationInputSchema),
        z.lazy(() => JrExtractionRuleUncheckedUpdateManyWithoutFindReplaceRulesInputSchema),
      ]),
    })
    .strict();

export default JrExtractionRuleUpdateManyWithWhereWithoutFindReplaceRulesInputSchema;
