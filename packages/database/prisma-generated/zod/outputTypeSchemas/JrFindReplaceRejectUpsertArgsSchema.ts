import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectIncludeSchema } from '../inputTypeSchemas/JrFindReplaceRejectIncludeSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectCreateInputSchema';
import { JrFindReplaceRejectUncheckedCreateInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectUncheckedCreateInputSchema';
import { JrFindReplaceRejectUpdateInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectUpdateInputSchema';
import { JrFindReplaceRejectUncheckedUpdateInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectUncheckedUpdateInputSchema';
import { BrandFindManyArgsSchema } from '../outputTypeSchemas/BrandFindManyArgsSchema';
import { LocationFindManyArgsSchema } from '../outputTypeSchemas/LocationFindManyArgsSchema';
import { TaxonomyFindManyArgsSchema } from '../outputTypeSchemas/TaxonomyFindManyArgsSchema';
import { StoryFindManyArgsSchema } from '../outputTypeSchemas/StoryFindManyArgsSchema';
import { FandomFindManyArgsSchema } from '../outputTypeSchemas/FandomFindManyArgsSchema';
import { SeriesFindManyArgsSchema } from '../outputTypeSchemas/SeriesFindManyArgsSchema';
import { CastFindManyArgsSchema } from '../outputTypeSchemas/CastFindManyArgsSchema';
import { JrExtractionRuleFindManyArgsSchema } from '../outputTypeSchemas/JrExtractionRuleFindManyArgsSchema';
import { JrFindReplaceRejectCountOutputTypeArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const JrFindReplaceRejectSelectSchema: z.ZodType<Prisma.JrFindReplaceRejectSelect> = z
  .object({
    id: z.boolean().optional(),
    lookFor: z.boolean().optional(),
    replaceWith: z.boolean().optional(),
    ruleAction: z.boolean().optional(),
    isRegex: z.boolean().optional(),
    regexFlags: z.boolean().optional(),
    priority: z.boolean().optional(),
    brands: z.union([z.boolean(), z.lazy(() => BrandFindManyArgsSchema)]).optional(),
    locations: z.union([z.boolean(), z.lazy(() => LocationFindManyArgsSchema)]).optional(),
    taxonomies: z.union([z.boolean(), z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
    stories: z.union([z.boolean(), z.lazy(() => StoryFindManyArgsSchema)]).optional(),
    fandoms: z.union([z.boolean(), z.lazy(() => FandomFindManyArgsSchema)]).optional(),
    series: z.union([z.boolean(), z.lazy(() => SeriesFindManyArgsSchema)]).optional(),
    casts: z.union([z.boolean(), z.lazy(() => CastFindManyArgsSchema)]).optional(),
    extractionRules: z
      .union([z.boolean(), z.lazy(() => JrExtractionRuleFindManyArgsSchema)])
      .optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectCountOutputTypeArgsSchema)])
      .optional(),
  })
  .strict();

export const JrFindReplaceRejectUpsertArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertArgs> =
  z
    .object({
      select: JrFindReplaceRejectSelectSchema.optional(),
      include: z.lazy(() => JrFindReplaceRejectIncludeSchema).optional(),
      where: JrFindReplaceRejectWhereUniqueInputSchema,
      create: z.union([
        JrFindReplaceRejectCreateInputSchema,
        JrFindReplaceRejectUncheckedCreateInputSchema,
      ]),
      update: z.union([
        JrFindReplaceRejectUpdateInputSchema,
        JrFindReplaceRejectUncheckedUpdateInputSchema,
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpsertArgsSchema;
