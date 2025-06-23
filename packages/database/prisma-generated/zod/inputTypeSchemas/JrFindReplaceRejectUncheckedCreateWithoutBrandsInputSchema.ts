import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';
import { LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { TaxonomyUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './TaxonomyUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { StoryUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './StoryUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { SeriesUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './SeriesUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema';
import { JrExtractionRuleUncheckedCreateNestedManyWithoutFindReplaceRulesInputSchema } from './JrExtractionRuleUncheckedCreateNestedManyWithoutFindReplaceRulesInputSchema';

export const JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedCreateWithoutBrandsInput> =
  z
    .object({
      id: z.number().int().optional(),
      lookFor: z.string(),
      replaceWith: z.string().optional().nullable(),
      ruleAction: z.lazy(() => JrRuleActionSchema).optional(),
      isRegex: z.boolean().optional(),
      regexFlags: z.string().optional().nullable(),
      priority: z.number().int().optional(),
      locations: z
        .lazy(() => LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      taxonomies: z
        .lazy(() => TaxonomyUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
        .optional(),
      stories: z
        .lazy(() => StoryUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema)
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

export default JrFindReplaceRejectUncheckedCreateWithoutBrandsInputSchema;
