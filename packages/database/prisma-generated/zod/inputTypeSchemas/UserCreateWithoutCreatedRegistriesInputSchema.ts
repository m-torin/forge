import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateexpertiseInputSchema } from './UserCreateexpertiseInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { SessionCreateNestedManyWithoutUserInputSchema } from './SessionCreateNestedManyWithoutUserInputSchema';
import { AccountCreateNestedManyWithoutUserInputSchema } from './AccountCreateNestedManyWithoutUserInputSchema';
import { MemberCreateNestedManyWithoutUserInputSchema } from './MemberCreateNestedManyWithoutUserInputSchema';
import { ApiKeyCreateNestedManyWithoutUserInputSchema } from './ApiKeyCreateNestedManyWithoutUserInputSchema';
import { TwoFactorCreateNestedOneWithoutUserInputSchema } from './TwoFactorCreateNestedOneWithoutUserInputSchema';
import { PasskeyCreateNestedManyWithoutUserInputSchema } from './PasskeyCreateNestedManyWithoutUserInputSchema';
import { ArticleCreateNestedManyWithoutUserInputSchema } from './ArticleCreateNestedManyWithoutUserInputSchema';
import { CollectionCreateNestedManyWithoutUserInputSchema } from './CollectionCreateNestedManyWithoutUserInputSchema';
import { MediaCreateNestedManyWithoutUserInputSchema } from './MediaCreateNestedManyWithoutUserInputSchema';
import { FavoriteJoinCreateNestedManyWithoutUserInputSchema } from './FavoriteJoinCreateNestedManyWithoutUserInputSchema';
import { ReviewCreateNestedManyWithoutUserInputSchema } from './ReviewCreateNestedManyWithoutUserInputSchema';
import { RegistryUserJoinCreateNestedManyWithoutUserInputSchema } from './RegistryUserJoinCreateNestedManyWithoutUserInputSchema';
import { RegistryPurchaseJoinCreateNestedManyWithoutPurchaserInputSchema } from './RegistryPurchaseJoinCreateNestedManyWithoutPurchaserInputSchema';
import { ReviewVoteJoinCreateNestedManyWithoutUserInputSchema } from './ReviewVoteJoinCreateNestedManyWithoutUserInputSchema';
import { AddressCreateNestedManyWithoutUserInputSchema } from './AddressCreateNestedManyWithoutUserInputSchema';
import { CartCreateNestedManyWithoutUserInputSchema } from './CartCreateNestedManyWithoutUserInputSchema';
import { OrderCreateNestedManyWithoutUserInputSchema } from './OrderCreateNestedManyWithoutUserInputSchema';
import { InvitationCreateNestedManyWithoutInvitedByInputSchema } from './InvitationCreateNestedManyWithoutInvitedByInputSchema';
import { TeamMemberCreateNestedManyWithoutUserInputSchema } from './TeamMemberCreateNestedManyWithoutUserInputSchema';
import { ArticleCreateNestedManyWithoutDeletedByInputSchema } from './ArticleCreateNestedManyWithoutDeletedByInputSchema';
import { BrandCreateNestedManyWithoutDeletedByInputSchema } from './BrandCreateNestedManyWithoutDeletedByInputSchema';
import { CollectionCreateNestedManyWithoutDeletedByInputSchema } from './CollectionCreateNestedManyWithoutDeletedByInputSchema';
import { ProductCreateNestedManyWithoutDeletedByInputSchema } from './ProductCreateNestedManyWithoutDeletedByInputSchema';
import { TaxonomyCreateNestedManyWithoutDeletedByInputSchema } from './TaxonomyCreateNestedManyWithoutDeletedByInputSchema';
import { ReviewCreateNestedManyWithoutDeletedByInputSchema } from './ReviewCreateNestedManyWithoutDeletedByInputSchema';
import { RegistryCreateNestedManyWithoutDeletedByInputSchema } from './RegistryCreateNestedManyWithoutDeletedByInputSchema';
import { RegistryItemCreateNestedManyWithoutDeletedByInputSchema } from './RegistryItemCreateNestedManyWithoutDeletedByInputSchema';
import { MediaCreateNestedManyWithoutDeletedByInputSchema } from './MediaCreateNestedManyWithoutDeletedByInputSchema';
import { ProductCategoryCreateNestedManyWithoutDeletedByInputSchema } from './ProductCategoryCreateNestedManyWithoutDeletedByInputSchema';
import { LocationCreateNestedManyWithoutDeletedByInputSchema } from './LocationCreateNestedManyWithoutDeletedByInputSchema';
import { CastCreateNestedManyWithoutDeletedByInputSchema } from './CastCreateNestedManyWithoutDeletedByInputSchema';
import { FandomCreateNestedManyWithoutDeletedByInputSchema } from './FandomCreateNestedManyWithoutDeletedByInputSchema';
import { SeriesCreateNestedManyWithoutDeletedByInputSchema } from './SeriesCreateNestedManyWithoutDeletedByInputSchema';
import { StoryCreateNestedManyWithoutDeletedByInputSchema } from './StoryCreateNestedManyWithoutDeletedByInputSchema';

export const UserCreateWithoutCreatedRegistriesInputSchema: z.ZodType<Prisma.UserCreateWithoutCreatedRegistriesInput> = z.object({
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
  expertise: z.union([ z.lazy(() => UserCreateexpertiseInputSchema),z.string().array() ]).optional(),
  isVerifiedAuthor: z.boolean().optional(),
  authorSince: z.coerce.date().optional().nullable(),
  preferences: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  isSuspended: z.boolean().optional(),
  suspensionDetails: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  sessions: z.lazy(() => SessionCreateNestedManyWithoutUserInputSchema).optional(),
  accounts: z.lazy(() => AccountCreateNestedManyWithoutUserInputSchema).optional(),
  members: z.lazy(() => MemberCreateNestedManyWithoutUserInputSchema).optional(),
  apiKeys: z.lazy(() => ApiKeyCreateNestedManyWithoutUserInputSchema).optional(),
  twoFactor: z.lazy(() => TwoFactorCreateNestedOneWithoutUserInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyCreateNestedManyWithoutUserInputSchema).optional(),
  articles: z.lazy(() => ArticleCreateNestedManyWithoutUserInputSchema).optional(),
  collections: z.lazy(() => CollectionCreateNestedManyWithoutUserInputSchema).optional(),
  media: z.lazy(() => MediaCreateNestedManyWithoutUserInputSchema).optional(),
  favorites: z.lazy(() => FavoriteJoinCreateNestedManyWithoutUserInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutUserInputSchema).optional(),
  registries: z.lazy(() => RegistryUserJoinCreateNestedManyWithoutUserInputSchema).optional(),
  purchases: z.lazy(() => RegistryPurchaseJoinCreateNestedManyWithoutPurchaserInputSchema).optional(),
  reviewVotes: z.lazy(() => ReviewVoteJoinCreateNestedManyWithoutUserInputSchema).optional(),
  addresses: z.lazy(() => AddressCreateNestedManyWithoutUserInputSchema).optional(),
  carts: z.lazy(() => CartCreateNestedManyWithoutUserInputSchema).optional(),
  orders: z.lazy(() => OrderCreateNestedManyWithoutUserInputSchema).optional(),
  invitationsSent: z.lazy(() => InvitationCreateNestedManyWithoutInvitedByInputSchema).optional(),
  teamMemberships: z.lazy(() => TeamMemberCreateNestedManyWithoutUserInputSchema).optional(),
  deletedArticles: z.lazy(() => ArticleCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedBrands: z.lazy(() => BrandCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedCollections: z.lazy(() => CollectionCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedProducts: z.lazy(() => ProductCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedTaxonomies: z.lazy(() => TaxonomyCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedReviews: z.lazy(() => ReviewCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedRegistries: z.lazy(() => RegistryCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedRegistryItems: z.lazy(() => RegistryItemCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedMedia: z.lazy(() => MediaCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedProductCategories: z.lazy(() => ProductCategoryCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedLocations: z.lazy(() => LocationCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedCasts: z.lazy(() => CastCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedFandoms: z.lazy(() => FandomCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedSeries: z.lazy(() => SeriesCreateNestedManyWithoutDeletedByInputSchema).optional(),
  deletedStories: z.lazy(() => StoryCreateNestedManyWithoutDeletedByInputSchema).optional()
}).strict();

export default UserCreateWithoutCreatedRegistriesInputSchema;
