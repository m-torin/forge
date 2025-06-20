import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BrandOrderByWithRelationInputSchema } from './BrandOrderByWithRelationInputSchema';
import { JrExtractionRuleOrderByRelationAggregateInputSchema } from './JrExtractionRuleOrderByRelationAggregateInputSchema';

export const JollyRogerOrderByWithRelationInputSchema: z.ZodType<Prisma.JollyRogerOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  canChart: z.lazy(() => SortOrderSchema).optional(),
  chartingMethod: z.lazy(() => SortOrderSchema).optional(),
  brandId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sitemaps: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  gridUrls: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  pdpUrlPatterns: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  brand: z.lazy(() => BrandOrderByWithRelationInputSchema).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleOrderByRelationAggregateInputSchema).optional()
}).strict();

export default JollyRogerOrderByWithRelationInputSchema;
