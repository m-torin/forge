import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandIncludeSchema } from '../inputTypeSchemas/BrandIncludeSchema'
import { BrandCreateInputSchema } from '../inputTypeSchemas/BrandCreateInputSchema'
import { BrandUncheckedCreateInputSchema } from '../inputTypeSchemas/BrandUncheckedCreateInputSchema'
import { BrandArgsSchema } from "../outputTypeSchemas/BrandArgsSchema"
import { BrandFindManyArgsSchema } from "../outputTypeSchemas/BrandFindManyArgsSchema"
import { PdpJoinFindManyArgsSchema } from "../outputTypeSchemas/PdpJoinFindManyArgsSchema"
import { CollectionFindManyArgsSchema } from "../outputTypeSchemas/CollectionFindManyArgsSchema"
import { MediaFindManyArgsSchema } from "../outputTypeSchemas/MediaFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { JollyRogerArgsSchema } from "../outputTypeSchemas/JollyRogerArgsSchema"
import { ProductIdentifiersFindManyArgsSchema } from "../outputTypeSchemas/ProductIdentifiersFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { BrandCountOutputTypeArgsSchema } from "../outputTypeSchemas/BrandCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const BrandSelectSchema: z.ZodType<Prisma.BrandSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  slug: z.boolean().optional(),
  type: z.boolean().optional(),
  status: z.boolean().optional(),
  baseUrl: z.boolean().optional(),
  copy: z.boolean().optional(),
  parentId: z.boolean().optional(),
  displayOrder: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  deletedById: z.boolean().optional(),
  parent: z.union([z.boolean(),z.lazy(() => BrandArgsSchema)]).optional(),
  children: z.union([z.boolean(),z.lazy(() => BrandFindManyArgsSchema)]).optional(),
  products: z.union([z.boolean(),z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
  media: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  jollyRoger: z.union([z.boolean(),z.lazy(() => JollyRogerArgsSchema)]).optional(),
  identifiers: z.union([z.boolean(),z.lazy(() => ProductIdentifiersFindManyArgsSchema)]).optional(),
  manufacturedProducts: z.union([z.boolean(),z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BrandCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const BrandCreateArgsSchema: z.ZodType<Prisma.BrandCreateArgs> = z.object({
  select: BrandSelectSchema.optional(),
  include: z.lazy(() => BrandIncludeSchema).optional(),
  data: z.union([ BrandCreateInputSchema,BrandUncheckedCreateInputSchema ]),
}).strict() ;

export default BrandCreateArgsSchema;
