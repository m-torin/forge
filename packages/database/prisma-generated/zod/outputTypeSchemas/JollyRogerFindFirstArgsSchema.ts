import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerIncludeSchema } from '../inputTypeSchemas/JollyRogerIncludeSchema'
import { JollyRogerWhereInputSchema } from '../inputTypeSchemas/JollyRogerWhereInputSchema'
import { JollyRogerOrderByWithRelationInputSchema } from '../inputTypeSchemas/JollyRogerOrderByWithRelationInputSchema'
import { JollyRogerWhereUniqueInputSchema } from '../inputTypeSchemas/JollyRogerWhereUniqueInputSchema'
import { JollyRogerScalarFieldEnumSchema } from '../inputTypeSchemas/JollyRogerScalarFieldEnumSchema'
import { BrandArgsSchema } from "../outputTypeSchemas/BrandArgsSchema"
import { JrExtractionRuleFindManyArgsSchema } from "../outputTypeSchemas/JrExtractionRuleFindManyArgsSchema"
import { JollyRogerCountOutputTypeArgsSchema } from "../outputTypeSchemas/JollyRogerCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const JollyRogerSelectSchema: z.ZodType<Prisma.JollyRogerSelect> = z.object({
  id: z.boolean().optional(),
  canChart: z.boolean().optional(),
  chartingMethod: z.boolean().optional(),
  brandId: z.boolean().optional(),
  sitemaps: z.boolean().optional(),
  gridUrls: z.boolean().optional(),
  pdpUrlPatterns: z.boolean().optional(),
  brand: z.union([z.boolean(),z.lazy(() => BrandArgsSchema)]).optional(),
  extractionRules: z.union([z.boolean(),z.lazy(() => JrExtractionRuleFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => JollyRogerCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const JollyRogerFindFirstArgsSchema: z.ZodType<Prisma.JollyRogerFindFirstArgs> = z.object({
  select: JollyRogerSelectSchema.optional(),
  include: z.lazy(() => JollyRogerIncludeSchema).optional(),
  where: JollyRogerWhereInputSchema.optional(),
  orderBy: z.union([ JollyRogerOrderByWithRelationInputSchema.array(),JollyRogerOrderByWithRelationInputSchema ]).optional(),
  cursor: JollyRogerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ JollyRogerScalarFieldEnumSchema,JollyRogerScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default JollyRogerFindFirstArgsSchema;
