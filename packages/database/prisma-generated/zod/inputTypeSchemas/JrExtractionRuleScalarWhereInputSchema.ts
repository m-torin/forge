import type { Prisma } from '../../client';

import { z } from 'zod';
import { IntFilterSchema } from './IntFilterSchema';
import { EnumJrChartRuleForFilterSchema } from './EnumJrChartRuleForFilterSchema';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { FloatNullableFilterSchema } from './FloatNullableFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const JrExtractionRuleScalarWhereInputSchema: z.ZodType<Prisma.JrExtractionRuleScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => JrExtractionRuleScalarWhereInputSchema),z.lazy(() => JrExtractionRuleScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JrExtractionRuleScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JrExtractionRuleScalarWhereInputSchema),z.lazy(() => JrExtractionRuleScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  jollyRogerId: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  fieldName: z.union([ z.lazy(() => EnumJrChartRuleForFilterSchema),z.lazy(() => JrChartRuleForSchema) ]).optional(),
  isActive: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  selectors: z.lazy(() => JsonFilterSchema).optional(),
  mustContain: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  cannotContain: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  lastSuccessfulSelector: z.lazy(() => JsonNullableFilterSchema).optional(),
  successRate: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  lastTestedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default JrExtractionRuleScalarWhereInputSchema;
