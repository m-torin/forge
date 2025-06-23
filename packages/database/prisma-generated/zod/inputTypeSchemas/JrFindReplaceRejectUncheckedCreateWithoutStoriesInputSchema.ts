import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { BrandUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { JrExtractionRuleUncheckedCreateNestedManyWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedCreateNestedManyWithoutFindReplaceRulesInputSchema';

export const JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedCreateWithoutStoriesInput> =
  z
    .object({
      id: z.number().int().optional(),
      lookFor: z.string(),
      replaceWith: z.string().optional().nullable(),
      ruleAction: z.lazy(() => JrRuleActionSchema).optional(),
      isRegex: z.boolean().optional(),
      regexFlags: z.string().optional().nullable(),
      priority: z.number().int().optional(),
      brands: z
        .lazy(() => BrandUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      locations: z
        .lazy(() => LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      taxonomies: z
        .lazy(() => TaxonomyUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      fandoms: z
        .lazy(() => FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      series: z
        .lazy(() => SeriesUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      casts: z
        .lazy(() => CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      extractionRules: z
        .lazy(() => JrExtractionRuleUncheckedCreateNestedManyWithoutFindReplaceRulesInputSchema)
        .optional(),
    })
    .strict();

export default JrFindReplaceRejectUncheckedCreateWithoutStoriesInputSchema;
