import { z } from 'zod';
import type { Prisma } from '../../client';

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z
  .object({
    sessions: z.boolean().optional(),
    accounts: z.boolean().optional(),
    members: z.boolean().optional(),
    apiKeys: z.boolean().optional(),
    passkeys: z.boolean().optional(),
    articles: z.boolean().optional(),
    collections: z.boolean().optional(),
    media: z.boolean().optional(),
    favorites: z.boolean().optional(),
    reviews: z.boolean().optional(),
    createdRegistries: z.boolean().optional(),
    registries: z.boolean().optional(),
    purchases: z.boolean().optional(),
    reviewVotes: z.boolean().optional(),
    addresses: z.boolean().optional(),
    carts: z.boolean().optional(),
    orders: z.boolean().optional(),
    invitationsSent: z.boolean().optional(),
    teamMemberships: z.boolean().optional(),
    deletedArticles: z.boolean().optional(),
    deletedBrands: z.boolean().optional(),
    deletedCollections: z.boolean().optional(),
    deletedProducts: z.boolean().optional(),
    deletedTaxonomies: z.boolean().optional(),
    deletedReviews: z.boolean().optional(),
    deletedRegistries: z.boolean().optional(),
    deletedRegistryItems: z.boolean().optional(),
    deletedMedia: z.boolean().optional(),
    deletedProductCategories: z.boolean().optional(),
    deletedLocations: z.boolean().optional(),
    deletedCasts: z.boolean().optional(),
    deletedFandoms: z.boolean().optional(),
    deletedSeries: z.boolean().optional(),
    deletedStories: z.boolean().optional(),
  })
  .strict();

export default UserCountOutputTypeSelectSchema;
