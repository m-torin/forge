import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerIncludeSchema } from '../inputTypeSchemas/JollyRogerIncludeSchema';
import { JollyRogerWhereUniqueInputSchema } from '../inputTypeSchemas/JollyRogerWhereUniqueInputSchema';
import { JollyRogerCreateInputSchema } from '../inputTypeSchemas/JollyRogerCreateInputSchema';
import { JollyRogerUncheckedCreateInputSchema } from '../inputTypeSchemas/JollyRogerUncheckedCreateInputSchema';
import { JollyRogerUpdateInputSchema } from '../inputTypeSchemas/JollyRogerUpdateInputSchema';
import { JollyRogerUncheckedUpdateInputSchema } from '../inputTypeSchemas/JollyRogerUncheckedUpdateInputSchema';
import { BrandArgsSchema } from '../outputTypeSchemas/BrandArgsSchema';
import { JrExtractionRuleFindManyArgsSchema } from '../outputTypeSchemas/JrExtractionRuleFindManyArgsSchema';
import { JollyRogerCountOutputTypeArgsSchema } from '../outputTypeSchemas/JollyRogerCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const JollyRogerUpsertArgsSchema: z.ZodType<Prisma.JollyRogerUpsertArgs> = z
  .object({
    select: JollyRogerSelectSchema.optional(),
    include: z.lazy(() => JollyRogerIncludeSchema).optional(),
    where: JollyRogerWhereUniqueInputSchema,
    create: z.union([JollyRogerCreateInputSchema, JollyRogerUncheckedCreateInputSchema]),
    update: z.union([JollyRogerUpdateInputSchema, JollyRogerUncheckedUpdateInputSchema]),
  })
  .strict();

export default JollyRogerUpsertArgsSchema;
