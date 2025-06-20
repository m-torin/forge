import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JrExtractionRuleUncheckedCreateNestedManyWithoutJollyRogerInputSchema } from './JrExtractionRuleUncheckedCreateNestedManyWithoutJollyRogerInputSchema';

export const JollyRogerUncheckedCreateWithoutBrandInputSchema: z.ZodType<Prisma.JollyRogerUncheckedCreateWithoutBrandInput> = z.object({
  id: z.number().int().optional(),
  canChart: z.boolean().optional(),
  chartingMethod: z.lazy(() => JrChartMethodSchema).optional(),
  sitemaps: z.string().optional().nullable(),
  gridUrls: z.string().optional().nullable(),
  pdpUrlPatterns: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleUncheckedCreateNestedManyWithoutJollyRogerInputSchema).optional()
}).strict();

export default JollyRogerUncheckedCreateWithoutBrandInputSchema;
