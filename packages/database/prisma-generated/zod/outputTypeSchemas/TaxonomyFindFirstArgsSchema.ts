import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyIncludeSchema } from '../inputTypeSchemas/TaxonomyIncludeSchema'
import { TaxonomyWhereInputSchema } from '../inputTypeSchemas/TaxonomyWhereInputSchema'
import { TaxonomyOrderByWithRelationInputSchema } from '../inputTypeSchemas/TaxonomyOrderByWithRelationInputSchema'
import { TaxonomyWhereUniqueInputSchema } from '../inputTypeSchemas/TaxonomyWhereUniqueInputSchema'
import { TaxonomyScalarFieldEnumSchema } from '../inputTypeSchemas/TaxonomyScalarFieldEnumSchema'
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { CollectionFindManyArgsSchema } from "../outputTypeSchemas/CollectionFindManyArgsSchema"
import { PdpJoinFindManyArgsSchema } from "../outputTypeSchemas/PdpJoinFindManyArgsSchema"
import { LocationFindManyArgsSchema } from "../outputTypeSchemas/LocationFindManyArgsSchema"
import { MediaFindManyArgsSchema } from "../outputTypeSchemas/MediaFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { TaxonomyCountOutputTypeArgsSchema } from "../outputTypeSchemas/TaxonomyCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TaxonomySelectSchema: z.ZodType<Prisma.TaxonomySelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  type: z.boolean().optional(),
  status: z.boolean().optional(),
  copy: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  deletedById: z.boolean().optional(),
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
  pdpJoins: z.union([z.boolean(),z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
  locations: z.union([z.boolean(),z.lazy(() => LocationFindManyArgsSchema)]).optional(),
  media: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TaxonomyCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TaxonomyFindFirstArgsSchema: z.ZodType<Prisma.TaxonomyFindFirstArgs> = z.object({
  select: TaxonomySelectSchema.optional(),
  include: z.lazy(() => TaxonomyIncludeSchema).optional(),
  where: TaxonomyWhereInputSchema.optional(),
  orderBy: z.union([ TaxonomyOrderByWithRelationInputSchema.array(),TaxonomyOrderByWithRelationInputSchema ]).optional(),
  cursor: TaxonomyWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TaxonomyScalarFieldEnumSchema,TaxonomyScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default TaxonomyFindFirstArgsSchema;
