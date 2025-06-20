import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartMethodSchema } from './JrChartMethodSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { BrandCreateNestedOneWithoutJollyRogerInputSchema } from './BrandCreateNestedOneWithoutJollyRogerInputSchema';
import { JrExtractionRuleCreateNestedManyWithoutJollyRogerInputSchema } from './JrExtractionRuleCreateNestedManyWithoutJollyRogerInputSchema';

export const JollyRogerCreateInputSchema: z.ZodType<Prisma.JollyRogerCreateInput> = z.object({
  canChart: z.boolean().optional(),
  chartingMethod: z.lazy(() => JrChartMethodSchema).optional(),
  sitemaps: z.string().optional().nullable(),
  gridUrls: z.string().optional().nullable(),
  pdpUrlPatterns: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  brand: z.lazy(() => BrandCreateNestedOneWithoutJollyRogerInputSchema).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleCreateNestedManyWithoutJollyRogerInputSchema).optional()
}).strict();

export default JollyRogerCreateInputSchema;
