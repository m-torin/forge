import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BrandOrderByRelationAggregateInputSchema } from './BrandOrderByRelationAggregateInputSchema';
import { LocationOrderByRelationAggregateInputSchema } from './LocationOrderByRelationAggregateInputSchema';
import { TaxonomyOrderByRelationAggregateInputSchema } from './TaxonomyOrderByRelationAggregateInputSchema';
import { StoryOrderByRelationAggregateInputSchema } from './StoryOrderByRelationAggregateInputSchema';
import { FandomOrderByRelationAggregateInputSchema } from './FandomOrderByRelationAggregateInputSchema';
import { SeriesOrderByRelationAggregateInputSchema } from './SeriesOrderByRelationAggregateInputSchema';
import { CastOrderByRelationAggregateInputSchema } from './CastOrderByRelationAggregateInputSchema';
import { JrExtractionRuleOrderByRelationAggregateInputSchema } from './JrExtractionRuleOrderByRelationAggregateInputSchema';

export const JrFindReplaceRejectOrderByWithRelationInputSchema: z.ZodType<Prisma.JrFindReplaceRejectOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  lookFor: z.lazy(() => SortOrderSchema).optional(),
  replaceWith: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  ruleAction: z.lazy(() => SortOrderSchema).optional(),
  isRegex: z.lazy(() => SortOrderSchema).optional(),
  regexFlags: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  brands: z.lazy(() => BrandOrderByRelationAggregateInputSchema).optional(),
  locations: z.lazy(() => LocationOrderByRelationAggregateInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyOrderByRelationAggregateInputSchema).optional(),
  stories: z.lazy(() => StoryOrderByRelationAggregateInputSchema).optional(),
  fandoms: z.lazy(() => FandomOrderByRelationAggregateInputSchema).optional(),
  series: z.lazy(() => SeriesOrderByRelationAggregateInputSchema).optional(),
  casts: z.lazy(() => CastOrderByRelationAggregateInputSchema).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleOrderByRelationAggregateInputSchema).optional()
}).strict();

export default JrFindReplaceRejectOrderByWithRelationInputSchema;
