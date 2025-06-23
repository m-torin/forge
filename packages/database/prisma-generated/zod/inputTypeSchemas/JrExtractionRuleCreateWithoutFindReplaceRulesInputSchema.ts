import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { JollyRogerCreateNestedOneWithoutExtractionRulesInputSchema } from './JollyRogerCreateNestedOneWithoutExtractionRulesInputSchema';

export const JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema: z.ZodType<Prisma.JrExtractionRuleCreateWithoutFindReplaceRulesInput> =
  z
    .object({
      fieldName: z.lazy(() => JrChartRuleForSchema),
      isActive: z.boolean().optional(),
      selectors: z.union([z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema]).optional(),
      mustContain: z.string().optional().nullable(),
      cannotContain: z.string().optional().nullable(),
      lastSuccessfulSelector: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      successRate: z.number().optional().nullable(),
      lastTestedAt: z.coerce.date().optional().nullable(),
      notes: z.string().optional().nullable(),
      jollyRoger: z.lazy(() => JollyRogerCreateNestedOneWithoutExtractionRulesInputSchema),
    })
    .strict();

export default JrExtractionRuleCreateWithoutFindReplaceRulesInputSchema;
