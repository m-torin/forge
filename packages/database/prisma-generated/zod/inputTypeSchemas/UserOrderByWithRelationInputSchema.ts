import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { SessionOrderByRelationAggregateInputSchema } from './SessionOrderByRelationAggregateInputSchema';
import { AccountOrderByRelationAggregateInputSchema } from './AccountOrderByRelationAggregateInputSchema';
import { MemberOrderByRelationAggregateInputSchema } from './MemberOrderByRelationAggregateInputSchema';
import { ApiKeyOrderByRelationAggregateInputSchema } from './ApiKeyOrderByRelationAggregateInputSchema';
import { TwoFactorOrderByWithRelationInputSchema } from './TwoFactorOrderByWithRelationInputSchema';
import { PasskeyOrderByRelationAggregateInputSchema } from './PasskeyOrderByRelationAggregateInputSchema';
import { ArticleOrderByRelationAggregateInputSchema } from './ArticleOrderByRelationAggregateInputSchema';
import { CollectionOrderByRelationAggregateInputSchema } from './CollectionOrderByRelationAggregateInputSchema';
import { MediaOrderByRelationAggregateInputSchema } from './MediaOrderByRelationAggregateInputSchema';
import { FavoriteJoinOrderByRelationAggregateInputSchema } from './FavoriteJoinOrderByRelationAggregateInputSchema';
import { ReviewOrderByRelationAggregateInputSchema } from './ReviewOrderByRelationAggregateInputSchema';
import { RegistryOrderByRelationAggregateInputSchema } from './RegistryOrderByRelationAggregateInputSchema';
import { RegistryUserJoinOrderByRelationAggregateInputSchema } from './RegistryUserJoinOrderByRelationAggregateInputSchema';
import { RegistryPurchaseJoinOrderByRelationAggregateInputSchema } from './RegistryPurchaseJoinOrderByRelationAggregateInputSchema';
import { ReviewVoteJoinOrderByRelationAggregateInputSchema } from './ReviewVoteJoinOrderByRelationAggregateInputSchema';
import { AddressOrderByRelationAggregateInputSchema } from './AddressOrderByRelationAggregateInputSchema';
import { CartOrderByRelationAggregateInputSchema } from './CartOrderByRelationAggregateInputSchema';
import { OrderOrderByRelationAggregateInputSchema } from './OrderOrderByRelationAggregateInputSchema';
import { InvitationOrderByRelationAggregateInputSchema } from './InvitationOrderByRelationAggregateInputSchema';
import { TeamMemberOrderByRelationAggregateInputSchema } from './TeamMemberOrderByRelationAggregateInputSchema';
import { BrandOrderByRelationAggregateInputSchema } from './BrandOrderByRelationAggregateInputSchema';
import { ProductOrderByRelationAggregateInputSchema } from './ProductOrderByRelationAggregateInputSchema';
import { TaxonomyOrderByRelationAggregateInputSchema } from './TaxonomyOrderByRelationAggregateInputSchema';
import { RegistryItemOrderByRelationAggregateInputSchema } from './RegistryItemOrderByRelationAggregateInputSchema';
import { ProductCategoryOrderByRelationAggregateInputSchema } from './ProductCategoryOrderByRelationAggregateInputSchema';
import { LocationOrderByRelationAggregateInputSchema } from './LocationOrderByRelationAggregateInputSchema';
import { CastOrderByRelationAggregateInputSchema } from './CastOrderByRelationAggregateInputSchema';
import { FandomOrderByRelationAggregateInputSchema } from './FandomOrderByRelationAggregateInputSchema';
import { SeriesOrderByRelationAggregateInputSchema } from './SeriesOrderByRelationAggregateInputSchema';
import { StoryOrderByRelationAggregateInputSchema } from './StoryOrderByRelationAggregateInputSchema';

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z
  .object({
    id: z.lazy(() => SortOrderSchema).optional(),
    name: z.lazy(() => SortOrderSchema).optional(),
    email: z.lazy(() => SortOrderSchema).optional(),
    emailVerified: z.lazy(() => SortOrderSchema).optional(),
    image: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    phoneNumber: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    createdAt: z.lazy(() => SortOrderSchema).optional(),
    updatedAt: z.lazy(() => SortOrderSchema).optional(),
    role: z.lazy(() => SortOrderSchema).optional(),
    banned: z.lazy(() => SortOrderSchema).optional(),
    banReason: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    banExpires: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    deletedAt: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    bio: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
    expertise: z.lazy(() => SortOrderSchema).optional(),
    isVerifiedAuthor: z.lazy(() => SortOrderSchema).optional(),
    authorSince: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    preferences: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    isSuspended: z.lazy(() => SortOrderSchema).optional(),
    suspensionDetails: z
      .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
      .optional(),
    sessions: z.lazy(() => SessionOrderByRelationAggregateInputSchema).optional(),
    accounts: z.lazy(() => AccountOrderByRelationAggregateInputSchema).optional(),
    members: z.lazy(() => MemberOrderByRelationAggregateInputSchema).optional(),
    apiKeys: z.lazy(() => ApiKeyOrderByRelationAggregateInputSchema).optional(),
    twoFactor: z.lazy(() => TwoFactorOrderByWithRelationInputSchema).optional(),
    passkeys: z.lazy(() => PasskeyOrderByRelationAggregateInputSchema).optional(),
    articles: z.lazy(() => ArticleOrderByRelationAggregateInputSchema).optional(),
    collections: z.lazy(() => CollectionOrderByRelationAggregateInputSchema).optional(),
    media: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
    favorites: z.lazy(() => FavoriteJoinOrderByRelationAggregateInputSchema).optional(),
    reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
    createdRegistries: z.lazy(() => RegistryOrderByRelationAggregateInputSchema).optional(),
    registries: z.lazy(() => RegistryUserJoinOrderByRelationAggregateInputSchema).optional(),
    purchases: z.lazy(() => RegistryPurchaseJoinOrderByRelationAggregateInputSchema).optional(),
    reviewVotes: z.lazy(() => ReviewVoteJoinOrderByRelationAggregateInputSchema).optional(),
    addresses: z.lazy(() => AddressOrderByRelationAggregateInputSchema).optional(),
    carts: z.lazy(() => CartOrderByRelationAggregateInputSchema).optional(),
    orders: z.lazy(() => OrderOrderByRelationAggregateInputSchema).optional(),
    invitationsSent: z.lazy(() => InvitationOrderByRelationAggregateInputSchema).optional(),
    teamMemberships: z.lazy(() => TeamMemberOrderByRelationAggregateInputSchema).optional(),
    deletedArticles: z.lazy(() => ArticleOrderByRelationAggregateInputSchema).optional(),
    deletedBrands: z.lazy(() => BrandOrderByRelationAggregateInputSchema).optional(),
    deletedCollections: z.lazy(() => CollectionOrderByRelationAggregateInputSchema).optional(),
    deletedProducts: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
    deletedTaxonomies: z.lazy(() => TaxonomyOrderByRelationAggregateInputSchema).optional(),
    deletedReviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
    deletedRegistries: z.lazy(() => RegistryOrderByRelationAggregateInputSchema).optional(),
    deletedRegistryItems: z.lazy(() => RegistryItemOrderByRelationAggregateInputSchema).optional(),
    deletedMedia: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
    deletedProductCategories: z
      .lazy(() => ProductCategoryOrderByRelationAggregateInputSchema)
      .optional(),
    deletedLocations: z.lazy(() => LocationOrderByRelationAggregateInputSchema).optional(),
    deletedCasts: z.lazy(() => CastOrderByRelationAggregateInputSchema).optional(),
    deletedFandoms: z.lazy(() => FandomOrderByRelationAggregateInputSchema).optional(),
    deletedSeries: z.lazy(() => SeriesOrderByRelationAggregateInputSchema).optional(),
    deletedStories: z.lazy(() => StoryOrderByRelationAggregateInputSchema).optional(),
  })
  .strict();

export default UserOrderByWithRelationInputSchema;
