import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyArgsSchema } from '../outputTypeSchemas/TaxonomyArgsSchema';
import { TaxonomyFindManyArgsSchema } from '../outputTypeSchemas/TaxonomyFindManyArgsSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { CollectionFindManyArgsSchema } from '../outputTypeSchemas/CollectionFindManyArgsSchema';
import { PdpJoinFindManyArgsSchema } from '../outputTypeSchemas/PdpJoinFindManyArgsSchema';
import { LocationFindManyArgsSchema } from '../outputTypeSchemas/LocationFindManyArgsSchema';
import { MediaFindManyArgsSchema } from '../outputTypeSchemas/MediaFindManyArgsSchema';
import { JrFindReplaceRejectFindManyArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { TaxonomyCountOutputTypeArgsSchema } from '../outputTypeSchemas/TaxonomyCountOutputTypeArgsSchema';

export const TaxonomySelectSchema: z.ZodType<Prisma.TaxonomySelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    type: z.boolean().optional(),
    status: z.boolean().optional(),
    copy: z.boolean().optional(),
    parentId: z.boolean().optional(),
    displayOrder: z.boolean().optional(),
    level: z.boolean().optional(),
    path: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    parent: z.union([z.boolean(), z.lazy(() => TaxonomyArgsSchema)]).optional(),
    children: z.union([z.boolean(), z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
    products: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    collections: z.union([z.boolean(), z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
    pdpJoins: z.union([z.boolean(), z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
    locations: z.union([z.boolean(), z.lazy(() => LocationFindManyArgsSchema)]).optional(),
    media: z.union([z.boolean(), z.lazy(() => MediaFindManyArgsSchema)]).optional(),
    jrFindReplaceRejects: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)])
      .optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => TaxonomyCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export default TaxonomySelectSchema;
