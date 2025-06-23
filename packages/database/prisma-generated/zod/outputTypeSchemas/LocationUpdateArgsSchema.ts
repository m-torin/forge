import { z } from 'zod';
import type { Prisma } from '../../client';
import { LocationIncludeSchema } from '../inputTypeSchemas/LocationIncludeSchema';
import { LocationUpdateInputSchema } from '../inputTypeSchemas/LocationUpdateInputSchema';
import { LocationUncheckedUpdateInputSchema } from '../inputTypeSchemas/LocationUncheckedUpdateInputSchema';
import { LocationWhereUniqueInputSchema } from '../inputTypeSchemas/LocationWhereUniqueInputSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { FandomFindManyArgsSchema } from '../outputTypeSchemas/FandomFindManyArgsSchema';
import { PdpJoinFindManyArgsSchema } from '../outputTypeSchemas/PdpJoinFindManyArgsSchema';
import { TaxonomyFindManyArgsSchema } from '../outputTypeSchemas/TaxonomyFindManyArgsSchema';
import { JrFindReplaceRejectFindManyArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { LocationCountOutputTypeArgsSchema } from '../outputTypeSchemas/LocationCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const LocationSelectSchema: z.ZodType<Prisma.LocationSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    locationType: z.boolean().optional(),
    lodgingType: z.boolean().optional(),
    isFictional: z.boolean().optional(),
    copy: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    products: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    fandoms: z.union([z.boolean(), z.lazy(() => FandomFindManyArgsSchema)]).optional(),
    pdpJoins: z.union([z.boolean(), z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
    taxonomies: z.union([z.boolean(), z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
    jrFindReplaceRejects: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)])
      .optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => LocationCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const LocationUpdateArgsSchema: z.ZodType<Prisma.LocationUpdateArgs> = z
  .object({
    select: LocationSelectSchema.optional(),
    include: z.lazy(() => LocationIncludeSchema).optional(),
    data: z.union([LocationUpdateInputSchema, LocationUncheckedUpdateInputSchema]),
    where: LocationWhereUniqueInputSchema,
  })
  .strict();

export default LocationUpdateArgsSchema;
