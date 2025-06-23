import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { BrandCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './BrandCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { StoryCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './StoryCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { FandomCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './FandomCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { SeriesCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './SeriesCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { CastCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './CastCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { JrExtractionRuleCreateNestedManyWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleCreateNestedManyWithoutFindReplaceRulesInputSchema';

export const JrFindReplaceRejectCreateWithoutLocationsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateWithoutLocationsInput> =
  z
    .object({
      lookFor: z.string(),
      replaceWith: z.string().optional().nullable(),
      ruleAction: z.lazy(() => JrRuleActionSchema).optional(),
      isRegex: z.boolean().optional(),
      regexFlags: z.string().optional().nullable(),
      priority: z.number().int().optional(),
      brands: z.lazy(() => BrandCreateNestedManyWithoutJrFindReplaceRejectsInputSchema).optional(),
      taxonomies: z
        .lazy(() => TaxonomyCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      stories: z.lazy(() => StoryCreateNestedManyWithoutJrFindReplaceRejectsInputSchema).optional(),
      fandoms: z
        .lazy(() => FandomCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      series: z.lazy(() => SeriesCreateNestedManyWithoutJrFindReplaceRejectsInputSchema).optional(),
      casts: z.lazy(() => CastCreateNestedManyWithoutJrFindReplaceRejectsInputSchema).optional(),
      extractionRules: z
        .lazy(() => JrExtractionRuleCreateNestedManyWithoutFindReplaceRulesInputSchema)
        .optional(),
    })
    .strict();

export default JrFindReplaceRejectCreateWithoutLocationsInputSchema;
