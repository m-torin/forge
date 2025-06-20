import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { JollyRogerOrderByWithRelationInputSchema } from './JollyRogerOrderByWithRelationInputSchema';
import { JrFindReplaceRejectOrderByRelationAggregateInputSchema } from './JrFindReplaceRejectOrderByRelationAggregateInputSchema';

export const JrExtractionRuleOrderByWithRelationInputSchema: z.ZodType<Prisma.JrExtractionRuleOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  jollyRogerId: z.lazy(() => SortOrderSchema).optional(),
  fieldName: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  selectors: z.lazy(() => SortOrderSchema).optional(),
  mustContain: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  cannotContain: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastSuccessfulSelector: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  successRate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  lastTestedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  jollyRoger: z.lazy(() => JollyRogerOrderByWithRelationInputSchema).optional(),
  findReplaceRules: z.lazy(() => JrFindReplaceRejectOrderByRelationAggregateInputSchema).optional()
}).strict();

export default JrExtractionRuleOrderByWithRelationInputSchema;
