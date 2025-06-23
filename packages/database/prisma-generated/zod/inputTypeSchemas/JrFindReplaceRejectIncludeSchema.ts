import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandFindManyArgsSchema } from '../outputTypeSchemas/BrandFindManyArgsSchema';
import { LocationFindManyArgsSchema } from '../outputTypeSchemas/LocationFindManyArgsSchema';
import { TaxonomyFindManyArgsSchema } from '../outputTypeSchemas/TaxonomyFindManyArgsSchema';
import { StoryFindManyArgsSchema } from '../outputTypeSchemas/StoryFindManyArgsSchema';
import { FandomFindManyArgsSchema } from '../outputTypeSchemas/FandomFindManyArgsSchema';
import { SeriesFindManyArgsSchema } from '../outputTypeSchemas/SeriesFindManyArgsSchema';
import { CastFindManyArgsSchema } from '../outputTypeSchemas/CastFindManyArgsSchema';
import { JrExtractionRuleFindManyArgsSchema } from '../outputTypeSchemas/JrExtractionRuleFindManyArgsSchema';
import { JrFindReplaceRejectCountOutputTypeArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectCountOutputTypeArgsSchema';

export const JrFindReplaceRejectIncludeSchema: z.ZodType<Prisma.JrFindReplaceRejectInclude> = z
  .object({
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

export default JrFindReplaceRejectIncludeSchema;
