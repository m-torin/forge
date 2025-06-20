import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinIncludeSchema } from '../inputTypeSchemas/PdpJoinIncludeSchema'
import { PdpJoinCreateInputSchema } from '../inputTypeSchemas/PdpJoinCreateInputSchema'
import { PdpJoinUncheckedCreateInputSchema } from '../inputTypeSchemas/PdpJoinUncheckedCreateInputSchema'
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { BrandArgsSchema } from "../outputTypeSchemas/BrandArgsSchema"
import { TaxonomyFindManyArgsSchema } from "../outputTypeSchemas/TaxonomyFindManyArgsSchema"
import { LocationFindManyArgsSchema } from "../outputTypeSchemas/LocationFindManyArgsSchema"
import { CollectionFindManyArgsSchema } from "../outputTypeSchemas/CollectionFindManyArgsSchema"
import { MediaFindManyArgsSchema } from "../outputTypeSchemas/MediaFindManyArgsSchema"
import { BrandFindManyArgsSchema } from "../outputTypeSchemas/BrandFindManyArgsSchema"
import { ProductIdentifiersFindManyArgsSchema } from "../outputTypeSchemas/ProductIdentifiersFindManyArgsSchema"
import { PdpUrlFindManyArgsSchema } from "../outputTypeSchemas/PdpUrlFindManyArgsSchema"
import { PdpJoinCountOutputTypeArgsSchema } from "../outputTypeSchemas/PdpJoinCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PdpJoinSelectSchema: z.ZodType<Prisma.PdpJoinSelect> = z.object({
  id: z.boolean().optional(),
  productId: z.boolean().optional(),
  brandId: z.boolean().optional(),
  canonicalUrl: z.boolean().optional(),
  iframeUrl: z.boolean().optional(),
  tempMediaUrls: z.boolean().optional(),
  lastScanned: z.boolean().optional(),
  copy: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  brand: z.union([z.boolean(),z.lazy(() => BrandArgsSchema)]).optional(),
  taxonomies: z.union([z.boolean(),z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
  locations: z.union([z.boolean(),z.lazy(() => LocationFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
  media: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  manufacturerBrands: z.union([z.boolean(),z.lazy(() => BrandFindManyArgsSchema)]).optional(),
  identifiers: z.union([z.boolean(),z.lazy(() => ProductIdentifiersFindManyArgsSchema)]).optional(),
  urls: z.union([z.boolean(),z.lazy(() => PdpUrlFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => PdpJoinCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const PdpJoinCreateArgsSchema: z.ZodType<Prisma.PdpJoinCreateArgs> = z.object({
  select: PdpJoinSelectSchema.optional(),
  include: z.lazy(() => PdpJoinIncludeSchema).optional(),
  data: z.union([ PdpJoinCreateInputSchema,PdpJoinUncheckedCreateInputSchema ]),
}).strict() ;

export default PdpJoinCreateArgsSchema;
