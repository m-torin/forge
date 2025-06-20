import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateexpertiseInputSchema } from './UserUpdateexpertiseInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { SessionUncheckedUpdateManyWithoutUserNestedInputSchema } from './SessionUncheckedUpdateManyWithoutUserNestedInputSchema';
import { AccountUncheckedUpdateManyWithoutUserNestedInputSchema } from './AccountUncheckedUpdateManyWithoutUserNestedInputSchema';
import { MemberUncheckedUpdateManyWithoutUserNestedInputSchema } from './MemberUncheckedUpdateManyWithoutUserNestedInputSchema';
import { ApiKeyUncheckedUpdateManyWithoutUserNestedInputSchema } from './ApiKeyUncheckedUpdateManyWithoutUserNestedInputSchema';
import { TwoFactorUncheckedUpdateOneWithoutUserNestedInputSchema } from './TwoFactorUncheckedUpdateOneWithoutUserNestedInputSchema';
import { PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema } from './PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema';
import { ArticleUncheckedUpdateManyWithoutUserNestedInputSchema } from './ArticleUncheckedUpdateManyWithoutUserNestedInputSchema';
import { CollectionUncheckedUpdateManyWithoutUserNestedInputSchema } from './CollectionUncheckedUpdateManyWithoutUserNestedInputSchema';
import { MediaUncheckedUpdateManyWithoutUserNestedInputSchema } from './MediaUncheckedUpdateManyWithoutUserNestedInputSchema';
import { FavoriteJoinUncheckedUpdateManyWithoutUserNestedInputSchema } from './FavoriteJoinUncheckedUpdateManyWithoutUserNestedInputSchema';
import { ReviewUncheckedUpdateManyWithoutUserNestedInputSchema } from './ReviewUncheckedUpdateManyWithoutUserNestedInputSchema';
import { RegistryUncheckedUpdateManyWithoutCreatedByUserNestedInputSchema } from './RegistryUncheckedUpdateManyWithoutCreatedByUserNestedInputSchema';
import { RegistryUserJoinUncheckedUpdateManyWithoutUserNestedInputSchema } from './RegistryUserJoinUncheckedUpdateManyWithoutUserNestedInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateManyWithoutPurchaserNestedInputSchema } from './RegistryPurchaseJoinUncheckedUpdateManyWithoutPurchaserNestedInputSchema';
import { ReviewVoteJoinUncheckedUpdateManyWithoutUserNestedInputSchema } from './ReviewVoteJoinUncheckedUpdateManyWithoutUserNestedInputSchema';
import { AddressUncheckedUpdateManyWithoutUserNestedInputSchema } from './AddressUncheckedUpdateManyWithoutUserNestedInputSchema';
import { CartUncheckedUpdateManyWithoutUserNestedInputSchema } from './CartUncheckedUpdateManyWithoutUserNestedInputSchema';
import { OrderUncheckedUpdateManyWithoutUserNestedInputSchema } from './OrderUncheckedUpdateManyWithoutUserNestedInputSchema';
import { InvitationUncheckedUpdateManyWithoutInvitedByNestedInputSchema } from './InvitationUncheckedUpdateManyWithoutInvitedByNestedInputSchema';
import { TeamMemberUncheckedUpdateManyWithoutUserNestedInputSchema } from './TeamMemberUncheckedUpdateManyWithoutUserNestedInputSchema';
import { ArticleUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './ArticleUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { BrandUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './BrandUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { CollectionUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './CollectionUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { ProductUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './ProductUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './TaxonomyUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { ReviewUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './ReviewUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { RegistryUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './RegistryUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './RegistryItemUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { MediaUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './MediaUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { ProductCategoryUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './ProductCategoryUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { LocationUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './LocationUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { CastUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './CastUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { FandomUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './FandomUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { SeriesUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './SeriesUncheckedUpdateManyWithoutDeletedByNestedInputSchema';
import { StoryUncheckedUpdateManyWithoutDeletedByNestedInputSchema } from './StoryUncheckedUpdateManyWithoutDeletedByNestedInputSchema';

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  emailVerified: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  image: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  phoneNumber: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  banned: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  banReason: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  banExpires: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  bio: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expertise: z.union([ z.lazy(() => UserUpdateexpertiseInputSchema),z.string().array() ]).optional(),
  isVerifiedAuthor: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  authorSince: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  preferences: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  isSuspended: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  suspensionDetails: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  sessions: z.lazy(() => SessionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  members: z.lazy(() => MemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  apiKeys: z.lazy(() => ApiKeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  twoFactor: z.lazy(() => TwoFactorUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  articles: z.lazy(() => ArticleUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  collections: z.lazy(() => CollectionUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteJoinUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  createdRegistries: z.lazy(() => RegistryUncheckedUpdateManyWithoutCreatedByUserNestedInputSchema).optional(),
  registries: z.lazy(() => RegistryUserJoinUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => RegistryPurchaseJoinUncheckedUpdateManyWithoutPurchaserNestedInputSchema).optional(),
  reviewVotes: z.lazy(() => ReviewVoteJoinUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  addresses: z.lazy(() => AddressUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  carts: z.lazy(() => CartUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  invitationsSent: z.lazy(() => InvitationUncheckedUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  teamMemberships: z.lazy(() => TeamMemberUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  deletedArticles: z.lazy(() => ArticleUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedBrands: z.lazy(() => BrandUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedCollections: z.lazy(() => CollectionUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedProducts: z.lazy(() => ProductUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedTaxonomies: z.lazy(() => TaxonomyUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedReviews: z.lazy(() => ReviewUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedRegistries: z.lazy(() => RegistryUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedRegistryItems: z.lazy(() => RegistryItemUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedMedia: z.lazy(() => MediaUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedProductCategories: z.lazy(() => ProductCategoryUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedLocations: z.lazy(() => LocationUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedCasts: z.lazy(() => CastUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedFandoms: z.lazy(() => FandomUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedSeries: z.lazy(() => SeriesUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedStories: z.lazy(() => StoryUncheckedUpdateManyWithoutDeletedByNestedInputSchema).optional()
}).strict();

export default UserUncheckedUpdateInputSchema;
