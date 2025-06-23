import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandArgsSchema } from '../outputTypeSchemas/BrandArgsSchema';
import { JrExtractionRuleFindManyArgsSchema } from '../outputTypeSchemas/JrExtractionRuleFindManyArgsSchema';
import { JollyRogerCountOutputTypeArgsSchema } from '../outputTypeSchemas/JollyRogerCountOutputTypeArgsSchema';

export const JollyRogerSelectSchema: z.ZodType<Prisma.JollyRogerSelect> = z
  .object({
    id: z.boolean().optional(),
    canChart: z.boolean().optional(),
    chartingMethod: z.boolean().optional(),
    brandId: z.boolean().optional(),
    sitemaps: z.boolean().optional(),
    gridUrls: z.boolean().optional(),
    pdpUrlPatterns: z.boolean().optional(),
    brand: z.union([z.boolean(), z.lazy(() => BrandArgsSchema)]).optional(),
    extractionRules: z
      .union([z.boolean(), z.lazy(() => JrExtractionRuleFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => JollyRogerCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export default JollyRogerSelectSchema;
