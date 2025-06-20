import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereInputSchema } from './JrFindReplaceRejectWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumJrRuleActionFilterSchema } from './EnumJrRuleActionFilterSchema';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BrandListRelationFilterSchema } from './BrandListRelationFilterSchema';
import { LocationListRelationFilterSchema } from './LocationListRelationFilterSchema';
import { TaxonomyListRelationFilterSchema } from './TaxonomyListRelationFilterSchema';
import { StoryListRelationFilterSchema } from './StoryListRelationFilterSchema';
import { FandomListRelationFilterSchema } from './FandomListRelationFilterSchema';
import { SeriesListRelationFilterSchema } from './SeriesListRelationFilterSchema';
import { CastListRelationFilterSchema } from './CastListRelationFilterSchema';
import { JrExtractionRuleListRelationFilterSchema } from './JrExtractionRuleListRelationFilterSchema';

export const JrFindReplaceRejectWhereUniqueInputSchema: z.ZodType<Prisma.JrFindReplaceRejectWhereUniqueInput> = z.object({
  id: z.number().int()
})
.and(z.object({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => JrFindReplaceRejectWhereInputSchema),z.lazy(() => JrFindReplaceRejectWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JrFindReplaceRejectWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JrFindReplaceRejectWhereInputSchema),z.lazy(() => JrFindReplaceRejectWhereInputSchema).array() ]).optional(),
  lookFor: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  replaceWith: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  ruleAction: z.union([ z.lazy(() => EnumJrRuleActionFilterSchema),z.lazy(() => JrRuleActionSchema) ]).optional(),
  isRegex: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  regexFlags: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  priority: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  brands: z.lazy(() => BrandListRelationFilterSchema).optional(),
  locations: z.lazy(() => LocationListRelationFilterSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyListRelationFilterSchema).optional(),
  stories: z.lazy(() => StoryListRelationFilterSchema).optional(),
  fandoms: z.lazy(() => FandomListRelationFilterSchema).optional(),
  series: z.lazy(() => SeriesListRelationFilterSchema).optional(),
  casts: z.lazy(() => CastListRelationFilterSchema).optional(),
  extractionRules: z.lazy(() => JrExtractionRuleListRelationFilterSchema).optional()
}).strict());

export default JrFindReplaceRejectWhereUniqueInputSchema;
