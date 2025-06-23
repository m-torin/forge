import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { SessionListRelationFilterSchema } from './SessionListRelationFilterSchema';
import { AccountListRelationFilterSchema } from './AccountListRelationFilterSchema';
import { MemberListRelationFilterSchema } from './MemberListRelationFilterSchema';
import { ApiKeyListRelationFilterSchema } from './ApiKeyListRelationFilterSchema';
import { TwoFactorNullableScalarRelationFilterSchema } from './TwoFactorNullableScalarRelationFilterSchema';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';
import { PasskeyListRelationFilterSchema } from './PasskeyListRelationFilterSchema';
import { ArticleListRelationFilterSchema } from './ArticleListRelationFilterSchema';
import { CollectionListRelationFilterSchema } from './CollectionListRelationFilterSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';
import { FavoriteJoinListRelationFilterSchema } from './FavoriteJoinListRelationFilterSchema';
import { ReviewListRelationFilterSchema } from './ReviewListRelationFilterSchema';
import { RegistryListRelationFilterSchema } from './RegistryListRelationFilterSchema';
import { RegistryUserJoinListRelationFilterSchema } from './RegistryUserJoinListRelationFilterSchema';
import { RegistryPurchaseJoinListRelationFilterSchema } from './RegistryPurchaseJoinListRelationFilterSchema';
import { ReviewVoteJoinListRelationFilterSchema } from './ReviewVoteJoinListRelationFilterSchema';
import { AddressListRelationFilterSchema } from './AddressListRelationFilterSchema';
import { CartListRelationFilterSchema } from './CartListRelationFilterSchema';
import { OrderListRelationFilterSchema } from './OrderListRelationFilterSchema';
import { InvitationListRelationFilterSchema } from './InvitationListRelationFilterSchema';
import { TeamMemberListRelationFilterSchema } from './TeamMemberListRelationFilterSchema';
import { BrandListRelationFilterSchema } from './BrandListRelationFilterSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { TaxonomyListRelationFilterSchema } from './TaxonomyListRelationFilterSchema';
import { RegistryItemListRelationFilterSchema } from './RegistryItemListRelationFilterSchema';
import { ProductCategoryListRelationFilterSchema } from './ProductCategoryListRelationFilterSchema';
import { LocationListRelationFilterSchema } from './LocationListRelationFilterSchema';
import { CastListRelationFilterSchema } from './CastListRelationFilterSchema';
import { FandomListRelationFilterSchema } from './FandomListRelationFilterSchema';
import { SeriesListRelationFilterSchema } from './SeriesListRelationFilterSchema';
import { StoryListRelationFilterSchema } from './StoryListRelationFilterSchema';

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z
  .union([
    z.object({
      id: z.string(),
      email: z.string(),
    }),
    z.object({
      id: z.string(),
    }),
    z.object({
      email: z.string(),
    }),
  ])
  .and(
    z
      .object({
        id: z.string().optional(),
        email: z.string().optional(),
        AND: z
          .union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
          .optional(),
        OR: z
          .lazy(() => UserWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()])
          .optional(),
        name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        emailVerified: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        image: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        phoneNumber: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        role: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        banned: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        banReason: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        banExpires: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        deletedAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        bio: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        expertise: z.lazy(() => StringNullableListFilterSchema).optional(),
        isVerifiedAuthor: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        authorSince: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        preferences: z.lazy(() => JsonNullableFilterSchema).optional(),
        isSuspended: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        suspensionDetails: z.lazy(() => JsonNullableFilterSchema).optional(),
        sessions: z.lazy(() => SessionListRelationFilterSchema).optional(),
        accounts: z.lazy(() => AccountListRelationFilterSchema).optional(),
        members: z.lazy(() => MemberListRelationFilterSchema).optional(),
        apiKeys: z.lazy(() => ApiKeyListRelationFilterSchema).optional(),
        twoFactor: z
          .union([
            z.lazy(() => TwoFactorNullableScalarRelationFilterSchema),
            z.lazy(() => TwoFactorWhereInputSchema),
          ])
          .optional()
          .nullable(),
        passkeys: z.lazy(() => PasskeyListRelationFilterSchema).optional(),
        articles: z.lazy(() => ArticleListRelationFilterSchema).optional(),
        collections: z.lazy(() => CollectionListRelationFilterSchema).optional(),
        media: z.lazy(() => MediaListRelationFilterSchema).optional(),
        favorites: z.lazy(() => FavoriteJoinListRelationFilterSchema).optional(),
        reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
        createdRegistries: z.lazy(() => RegistryListRelationFilterSchema).optional(),
        registries: z.lazy(() => RegistryUserJoinListRelationFilterSchema).optional(),
        purchases: z.lazy(() => RegistryPurchaseJoinListRelationFilterSchema).optional(),
        reviewVotes: z.lazy(() => ReviewVoteJoinListRelationFilterSchema).optional(),
        addresses: z.lazy(() => AddressListRelationFilterSchema).optional(),
        carts: z.lazy(() => CartListRelationFilterSchema).optional(),
        orders: z.lazy(() => OrderListRelationFilterSchema).optional(),
        invitationsSent: z.lazy(() => InvitationListRelationFilterSchema).optional(),
        teamMemberships: z.lazy(() => TeamMemberListRelationFilterSchema).optional(),
        deletedArticles: z.lazy(() => ArticleListRelationFilterSchema).optional(),
        deletedBrands: z.lazy(() => BrandListRelationFilterSchema).optional(),
        deletedCollections: z.lazy(() => CollectionListRelationFilterSchema).optional(),
        deletedProducts: z.lazy(() => ProductListRelationFilterSchema).optional(),
        deletedTaxonomies: z.lazy(() => TaxonomyListRelationFilterSchema).optional(),
        deletedReviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
        deletedRegistries: z.lazy(() => RegistryListRelationFilterSchema).optional(),
        deletedRegistryItems: z.lazy(() => RegistryItemListRelationFilterSchema).optional(),
        deletedMedia: z.lazy(() => MediaListRelationFilterSchema).optional(),
        deletedProductCategories: z.lazy(() => ProductCategoryListRelationFilterSchema).optional(),
        deletedLocations: z.lazy(() => LocationListRelationFilterSchema).optional(),
        deletedCasts: z.lazy(() => CastListRelationFilterSchema).optional(),
        deletedFandoms: z.lazy(() => FandomListRelationFilterSchema).optional(),
        deletedSeries: z.lazy(() => SeriesListRelationFilterSchema).optional(),
        deletedStories: z.lazy(() => StoryListRelationFilterSchema).optional(),
      })
      .strict(),
  );

export default UserWhereUniqueInputSchema;
