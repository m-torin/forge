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
import { JollyRogerScalarRelationFilterSchema } from './JollyRogerScalarRelationFilterSchema';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';
import { JrFindReplaceRejectListRelationFilterSchema } from './JrFindReplaceRejectListRelationFilterSchema';

export const JrExtractionRuleWhereInputSchema: z.ZodType<Prisma.JrExtractionRuleWhereInput> = z.object({
  AND: z.union([ z.lazy(() => JrExtractionRuleWhereInputSchema),z.lazy(() => JrExtractionRuleWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JrExtractionRuleWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JrExtractionRuleWhereInputSchema),z.lazy(() => JrExtractionRuleWhereInputSchema).array() ]).optional(),
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
  jollyRoger: z.union([ z.lazy(() => JollyRogerScalarRelationFilterSchema),z.lazy(() => JollyRogerWhereInputSchema) ]).optional(),
  findReplaceRules: z.lazy(() => JrFindReplaceRejectListRelationFilterSchema).optional()
}).strict();

export default JrExtractionRuleWhereInputSchema;
