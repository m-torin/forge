import { z } from 'zod';
import type { Prisma } from '../../client';
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

export const PdpJoinIncludeSchema: z.ZodType<Prisma.PdpJoinInclude> = z.object({
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

export default PdpJoinIncludeSchema;
