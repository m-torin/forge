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
import { SessionUpdateManyWithoutUserNestedInputSchema } from './SessionUpdateManyWithoutUserNestedInputSchema';
import { AccountUpdateManyWithoutUserNestedInputSchema } from './AccountUpdateManyWithoutUserNestedInputSchema';
import { MemberUpdateManyWithoutUserNestedInputSchema } from './MemberUpdateManyWithoutUserNestedInputSchema';
import { ApiKeyUpdateManyWithoutUserNestedInputSchema } from './ApiKeyUpdateManyWithoutUserNestedInputSchema';
import { TwoFactorUpdateOneWithoutUserNestedInputSchema } from './TwoFactorUpdateOneWithoutUserNestedInputSchema';
import { PasskeyUpdateManyWithoutUserNestedInputSchema } from './PasskeyUpdateManyWithoutUserNestedInputSchema';
import { ArticleUpdateManyWithoutUserNestedInputSchema } from './ArticleUpdateManyWithoutUserNestedInputSchema';
import { CollectionUpdateManyWithoutUserNestedInputSchema } from './CollectionUpdateManyWithoutUserNestedInputSchema';
import { MediaUpdateManyWithoutUserNestedInputSchema } from './MediaUpdateManyWithoutUserNestedInputSchema';
import { FavoriteJoinUpdateManyWithoutUserNestedInputSchema } from './FavoriteJoinUpdateManyWithoutUserNestedInputSchema';
import { ReviewUpdateManyWithoutUserNestedInputSchema } from './ReviewUpdateManyWithoutUserNestedInputSchema';
import { RegistryUpdateManyWithoutCreatedByUserNestedInputSchema } from './RegistryUpdateManyWithoutCreatedByUserNestedInputSchema';
import { RegistryUserJoinUpdateManyWithoutUserNestedInputSchema } from './RegistryUserJoinUpdateManyWithoutUserNestedInputSchema';
import { RegistryPurchaseJoinUpdateManyWithoutPurchaserNestedInputSchema } from './RegistryPurchaseJoinUpdateManyWithoutPurchaserNestedInputSchema';
import { ReviewVoteJoinUpdateManyWithoutUserNestedInputSchema } from './ReviewVoteJoinUpdateManyWithoutUserNestedInputSchema';
import { AddressUpdateManyWithoutUserNestedInputSchema } from './AddressUpdateManyWithoutUserNestedInputSchema';
import { CartUpdateManyWithoutUserNestedInputSchema } from './CartUpdateManyWithoutUserNestedInputSchema';
import { OrderUpdateManyWithoutUserNestedInputSchema } from './OrderUpdateManyWithoutUserNestedInputSchema';
import { InvitationUpdateManyWithoutInvitedByNestedInputSchema } from './InvitationUpdateManyWithoutInvitedByNestedInputSchema';
import { TeamMemberUpdateManyWithoutUserNestedInputSchema } from './TeamMemberUpdateManyWithoutUserNestedInputSchema';
import { BrandUpdateManyWithoutDeletedByNestedInputSchema } from './BrandUpdateManyWithoutDeletedByNestedInputSchema';
import { CollectionUpdateManyWithoutDeletedByNestedInputSchema } from './CollectionUpdateManyWithoutDeletedByNestedInputSchema';
import { ProductUpdateManyWithoutDeletedByNestedInputSchema } from './ProductUpdateManyWithoutDeletedByNestedInputSchema';
import { TaxonomyUpdateManyWithoutDeletedByNestedInputSchema } from './TaxonomyUpdateManyWithoutDeletedByNestedInputSchema';
import { ReviewUpdateManyWithoutDeletedByNestedInputSchema } from './ReviewUpdateManyWithoutDeletedByNestedInputSchema';
import { RegistryUpdateManyWithoutDeletedByNestedInputSchema } from './RegistryUpdateManyWithoutDeletedByNestedInputSchema';
import { RegistryItemUpdateManyWithoutDeletedByNestedInputSchema } from './RegistryItemUpdateManyWithoutDeletedByNestedInputSchema';
import { MediaUpdateManyWithoutDeletedByNestedInputSchema } from './MediaUpdateManyWithoutDeletedByNestedInputSchema';
import { ProductCategoryUpdateManyWithoutDeletedByNestedInputSchema } from './ProductCategoryUpdateManyWithoutDeletedByNestedInputSchema';
import { LocationUpdateManyWithoutDeletedByNestedInputSchema } from './LocationUpdateManyWithoutDeletedByNestedInputSchema';
import { CastUpdateManyWithoutDeletedByNestedInputSchema } from './CastUpdateManyWithoutDeletedByNestedInputSchema';
import { FandomUpdateManyWithoutDeletedByNestedInputSchema } from './FandomUpdateManyWithoutDeletedByNestedInputSchema';
import { SeriesUpdateManyWithoutDeletedByNestedInputSchema } from './SeriesUpdateManyWithoutDeletedByNestedInputSchema';
import { StoryUpdateManyWithoutDeletedByNestedInputSchema } from './StoryUpdateManyWithoutDeletedByNestedInputSchema';

export const UserUpdateWithoutDeletedArticlesInputSchema: z.ZodType<Prisma.UserUpdateWithoutDeletedArticlesInput> = z.object({
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
  sessions: z.lazy(() => SessionUpdateManyWithoutUserNestedInputSchema).optional(),
  accounts: z.lazy(() => AccountUpdateManyWithoutUserNestedInputSchema).optional(),
  members: z.lazy(() => MemberUpdateManyWithoutUserNestedInputSchema).optional(),
  apiKeys: z.lazy(() => ApiKeyUpdateManyWithoutUserNestedInputSchema).optional(),
  twoFactor: z.lazy(() => TwoFactorUpdateOneWithoutUserNestedInputSchema).optional(),
  passkeys: z.lazy(() => PasskeyUpdateManyWithoutUserNestedInputSchema).optional(),
  articles: z.lazy(() => ArticleUpdateManyWithoutUserNestedInputSchema).optional(),
  collections: z.lazy(() => CollectionUpdateManyWithoutUserNestedInputSchema).optional(),
  media: z.lazy(() => MediaUpdateManyWithoutUserNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoriteJoinUpdateManyWithoutUserNestedInputSchema).optional(),
  reviews: z.lazy(() => ReviewUpdateManyWithoutUserNestedInputSchema).optional(),
  createdRegistries: z.lazy(() => RegistryUpdateManyWithoutCreatedByUserNestedInputSchema).optional(),
  registries: z.lazy(() => RegistryUserJoinUpdateManyWithoutUserNestedInputSchema).optional(),
  purchases: z.lazy(() => RegistryPurchaseJoinUpdateManyWithoutPurchaserNestedInputSchema).optional(),
  reviewVotes: z.lazy(() => ReviewVoteJoinUpdateManyWithoutUserNestedInputSchema).optional(),
  addresses: z.lazy(() => AddressUpdateManyWithoutUserNestedInputSchema).optional(),
  carts: z.lazy(() => CartUpdateManyWithoutUserNestedInputSchema).optional(),
  orders: z.lazy(() => OrderUpdateManyWithoutUserNestedInputSchema).optional(),
  invitationsSent: z.lazy(() => InvitationUpdateManyWithoutInvitedByNestedInputSchema).optional(),
  teamMemberships: z.lazy(() => TeamMemberUpdateManyWithoutUserNestedInputSchema).optional(),
  deletedBrands: z.lazy(() => BrandUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedCollections: z.lazy(() => CollectionUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedProducts: z.lazy(() => ProductUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedTaxonomies: z.lazy(() => TaxonomyUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedReviews: z.lazy(() => ReviewUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedRegistries: z.lazy(() => RegistryUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedRegistryItems: z.lazy(() => RegistryItemUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedMedia: z.lazy(() => MediaUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedProductCategories: z.lazy(() => ProductCategoryUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedLocations: z.lazy(() => LocationUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedCasts: z.lazy(() => CastUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedFandoms: z.lazy(() => FandomUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedSeries: z.lazy(() => SeriesUpdateManyWithoutDeletedByNestedInputSchema).optional(),
  deletedStories: z.lazy(() => StoryUpdateManyWithoutDeletedByNestedInputSchema).optional()
}).strict();

export default UserUpdateWithoutDeletedArticlesInputSchema;
