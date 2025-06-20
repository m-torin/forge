import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema';
import { JrExtractionRuleWhereUniqueInputSchema } from './JrExtractionRuleWhereUniqueInputSchema';

export const JrExtractionRuleCreateNestedManyWithoutFindReplaceRulesInputSchema: z.ZodType<Prisma.JrExtractionRuleCreateNestedManyWithoutFindReplaceRulesInput> = z.object({
  create: z.union([ z.lazy(() => JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema).array(),z.lazy(() => JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleUncheckedCreateWithoutFindReplaceRulesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema),z.lazy(() => JrExtractionRuleCreateOrConnectWithoutFindReplaceRulesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => JrExtractionRuleWhereUniqueInputSchema),z.lazy(() => JrExtractionRuleWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default JrExtractionRuleCreateNestedManyWithoutFindReplaceRulesInputSchema;
