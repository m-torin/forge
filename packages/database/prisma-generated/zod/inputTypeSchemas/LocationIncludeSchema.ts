import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { FandomFindManyArgsSchema } from "../outputTypeSchemas/FandomFindManyArgsSchema"
import { PdpJoinFindManyArgsSchema } from "../outputTypeSchemas/PdpJoinFindManyArgsSchema"
import { TaxonomyFindManyArgsSchema } from "../outputTypeSchemas/TaxonomyFindManyArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { LocationCountOutputTypeArgsSchema } from "../outputTypeSchemas/LocationCountOutputTypeArgsSchema"

export const LocationIncludeSchema: z.ZodType<Prisma.LocationInclude> = z.object({
  products: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  fandoms: z.union([z.boolean(),z.lazy(() => FandomFindManyArgsSchema)]).optional(),
  pdpJoins: z.union([z.boolean(),z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
  taxonomies: z.union([z.boolean(),z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
  jrFindReplaceRejects: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => LocationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default LocationIncludeSchema;
