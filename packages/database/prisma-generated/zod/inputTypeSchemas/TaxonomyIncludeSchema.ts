import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { CollectionFindManyArgsSchema } from "../outputTypeSchemas/CollectionFindManyArgsSchema"
import { PdpJoinFindManyArgsSchema } from "../outputTypeSchemas/PdpJoinFindManyArgsSchema"
import { LocationFindManyArgsSchema } from "../outputTypeSchemas/LocationFindManyArgsSchema"
import { MediaFindManyArgsSchema } from "../outputTypeSchemas/MediaFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { TaxonomyCountOutputTypeArgsSchema } from "../outputTypeSchemas/TaxonomyCountOutputTypeArgsSchema"

export const TaxonomyIncludeSchema: z.ZodType<Prisma.TaxonomyInclude> = z.object({
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
  pdpJoins: z.union([z.boolean(),z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
  locations: z.union([z.boolean(),z.lazy(() => LocationFindManyArgsSchema)]).optional(),
  media: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TaxonomyCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default TaxonomyIncludeSchema;
