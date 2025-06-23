import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateexpertiseInputSchema } from './UserCreateexpertiseInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { SessionUncheckedCreateNestedManyWithoutUserInputSchema } from './SessionUncheckedCreateNestedManyWithoutUserInputSchema';
import { AccountUncheckedCreateNestedManyWithoutUserInputSchema } from './AccountUncheckedCreateNestedManyWithoutUserInputSchema';
import { MemberUncheckedCreateNestedManyWithoutUserInputSchema } from './MemberUncheckedCreateNestedManyWithoutUserInputSchema';
import { ApiKeyUncheckedCreateNestedManyWithoutUserInputSchema } from './ApiKeyUncheckedCreateNestedManyWithoutUserInputSchema';
import { TwoFactorUncheckedCreateNestedOneWithoutUserInputSchema } from './TwoFactorUncheckedCreateNestedOneWithoutUserInputSchema';
import { PasskeyUncheckedCreateNestedManyWithoutUserInputSchema } from './PasskeyUncheckedCreateNestedManyWithoutUserInputSchema';
import { ArticleUncheckedCreateNestedManyWithoutUserInputSchema } from './ArticleUncheckedCreateNestedManyWithoutUserInputSchema';
import { MediaUncheckedCreateNestedManyWithoutUserInputSchema } from './MediaUncheckedCreateNestedManyWithoutUserInputSchema';
import { FavoriteJoinUncheckedCreateNestedManyWithoutUserInputSchema } from './FavoriteJoinUncheckedCreateNestedManyWithoutUserInputSchema';
import { ReviewUncheckedCreateNestedManyWithoutUserInputSchema } from './ReviewUncheckedCreateNestedManyWithoutUserInputSchema';
import { RegistryUncheckedCreateNestedManyWithoutCreatedByUserInputSchema } from './RegistryUncheckedCreateNestedManyWithoutCreatedByUserInputSchema';
import { RegistryUserJoinUncheckedCreateNestedManyWithoutUserInputSchema } from './RegistryUserJoinUncheckedCreateNestedManyWithoutUserInputSchema';
import { RegistryPurchaseJoinUncheckedCreateNestedManyWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedCreateNestedManyWithoutPurchaserInputSchema';
import { ReviewVoteJoinUncheckedCreateNestedManyWithoutUserInputSchema } from './ReviewVoteJoinUncheckedCreateNestedManyWithoutUserInputSchema';
import { AddressUncheckedCreateNestedManyWithoutUserInputSchema } from './AddressUncheckedCreateNestedManyWithoutUserInputSchema';
import { CartUncheckedCreateNestedManyWithoutUserInputSchema } from './CartUncheckedCreateNestedManyWithoutUserInputSchema';
import { OrderUncheckedCreateNestedManyWithoutUserInputSchema } from './OrderUncheckedCreateNestedManyWithoutUserInputSchema';
import { InvitationUncheckedCreateNestedManyWithoutInvitedByInputSchema } from './InvitationUncheckedCreateNestedManyWithoutInvitedByInputSchema';
import { TeamMemberUncheckedCreateNestedManyWithoutUserInputSchema } from './TeamMemberUncheckedCreateNestedManyWithoutUserInputSchema';
import { ArticleUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './ArticleUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { BrandUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './BrandUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './CollectionUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { ProductUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './ProductUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { TaxonomyUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './TaxonomyUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { ReviewUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './ReviewUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { RegistryUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './RegistryUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { RegistryItemUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './RegistryItemUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { MediaUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './MediaUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { ProductCategoryUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './ProductCategoryUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { LocationUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './LocationUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { CastUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './CastUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { FandomUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './FandomUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { SeriesUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './SeriesUncheckedCreateNestedManyWithoutDeletedByInputSchema';
import { StoryUncheckedCreateNestedManyWithoutDeletedByInputSchema } from './StoryUncheckedCreateNestedManyWithoutDeletedByInputSchema';

export const UserUncheckedCreateWithoutCollectionsInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutCollectionsInput> =
  z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      emailVerified: z.boolean(),
      image: z.string().optional().nullable(),
      phoneNumber: z.string().optional().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      role: z.string().optional(),
      banned: z.boolean().optional(),
      banReason: z.string().optional().nullable(),
      banExpires: z.coerce.date().optional().nullable(),
      deletedAt: z.coerce.date().optional().nullable(),
      bio: z.string().optional().nullable(),
      expertise: z
        .union([z.lazy(() => UserCreateexpertiseInputSchema), z.string().array()])
        .optional(),
      isVerifiedAuthor: z.boolean().optional(),
      authorSince: z.coerce.date().optional().nullable(),
      preferences: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      isSuspended: z.boolean().optional(),
      suspensionDetails: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      sessions: z.lazy(() => SessionUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      accounts: z.lazy(() => AccountUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      members: z.lazy(() => MemberUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      apiKeys: z.lazy(() => ApiKeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      twoFactor: z.lazy(() => TwoFactorUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
      passkeys: z.lazy(() => PasskeyUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      articles: z.lazy(() => ArticleUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      favorites: z
        .lazy(() => FavoriteJoinUncheckedCreateNestedManyWithoutUserInputSchema)
        .optional(),
      reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      createdRegistries: z
        .lazy(() => RegistryUncheckedCreateNestedManyWithoutCreatedByUserInputSchema)
        .optional(),
      registries: z
        .lazy(() => RegistryUserJoinUncheckedCreateNestedManyWithoutUserInputSchema)
        .optional(),
      purchases: z
        .lazy(() => RegistryPurchaseJoinUncheckedCreateNestedManyWithoutPurchaserInputSchema)
        .optional(),
      reviewVotes: z
        .lazy(() => ReviewVoteJoinUncheckedCreateNestedManyWithoutUserInputSchema)
        .optional(),
      addresses: z.lazy(() => AddressUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      carts: z.lazy(() => CartUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      orders: z.lazy(() => OrderUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
      invitationsSent: z
        .lazy(() => InvitationUncheckedCreateNestedManyWithoutInvitedByInputSchema)
        .optional(),
      teamMemberships: z
        .lazy(() => TeamMemberUncheckedCreateNestedManyWithoutUserInputSchema)
        .optional(),
      deletedArticles: z
        .lazy(() => ArticleUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedBrands: z
        .lazy(() => BrandUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedCollections: z
        .lazy(() => CollectionUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedProducts: z
        .lazy(() => ProductUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedTaxonomies: z
        .lazy(() => TaxonomyUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedReviews: z
        .lazy(() => ReviewUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedRegistries: z
        .lazy(() => RegistryUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedRegistryItems: z
        .lazy(() => RegistryItemUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedMedia: z
        .lazy(() => MediaUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedProductCategories: z
        .lazy(() => ProductCategoryUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedLocations: z
        .lazy(() => LocationUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedCasts: z
        .lazy(() => CastUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedFandoms: z
        .lazy(() => FandomUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedSeries: z
        .lazy(() => SeriesUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
      deletedStories: z
        .lazy(() => StoryUncheckedCreateNestedManyWithoutDeletedByInputSchema)
        .optional(),
    })
    .strict();

export default UserUncheckedCreateWithoutCollectionsInputSchema;
