import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { EnumJrChartRuleForWithAggregatesFilterSchema } from './EnumJrChartRuleForWithAggregatesFilterSchema';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { JsonNullableWithAggregatesFilterSchema } from './JsonNullableWithAggregatesFilterSchema';
import { FloatNullableWithAggregatesFilterSchema } from './FloatNullableWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';

export const JrExtractionRuleScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.JrExtractionRuleScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => JrExtractionRuleScalarWhereWithAggregatesInputSchema),
          z.lazy(() => JrExtractionRuleScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => JrExtractionRuleScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => JrExtractionRuleScalarWhereWithAggregatesInputSchema),
          z.lazy(() => JrExtractionRuleScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      jollyRogerId: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      fieldName: z
        .union([
          z.lazy(() => EnumJrChartRuleForWithAggregatesFilterSchema),
          z.lazy(() => JrChartRuleForSchema),
        ])
        .optional(),
      isActive: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      selectors: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
      mustContain: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      cannotContain: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      lastSuccessfulSelector: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
      successRate: z
        .union([z.lazy(() => FloatNullableWithAggregatesFilterSchema), z.number()])
        .optional()
        .nullable(),
      lastTestedAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      notes: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
    })
    .strict();

export default JrExtractionRuleScalarWhereWithAggregatesInputSchema;
