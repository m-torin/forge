import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { JrFindReplaceRejectUncheckedCreateNestedManyWithoutExtractionRulesInputSchema } from './JrFindReplaceRejectUncheckedCreateNestedManyWithoutExtractionRulesInputSchema';

export const JrExtractionRuleUncheckedCreateInputSchema: z.ZodType<Prisma.JrExtractionRuleUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  jollyRogerId: z.number().int(),
  fieldName: z.lazy(() => JrChartRuleForSchema),
  isActive: z.boolean().optional(),
  selectors: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  mustContain: z.string().optional().nullable(),
  cannotContain: z.string().optional().nullable(),
  lastSuccessfulSelector: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  successRate: z.number().optional().nullable(),
  lastTestedAt: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
  findReplaceRules: z.lazy(() => JrFindReplaceRejectUncheckedCreateNestedManyWithoutExtractionRulesInputSchema).optional()
}).strict();

export default JrExtractionRuleUncheckedCreateInputSchema;
