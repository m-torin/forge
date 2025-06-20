import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserIncludeSchema } from '../inputTypeSchemas/UserIncludeSchema'
import { UserWhereInputSchema } from '../inputTypeSchemas/UserWhereInputSchema'
import { UserOrderByWithRelationInputSchema } from '../inputTypeSchemas/UserOrderByWithRelationInputSchema'
import { UserWhereUniqueInputSchema } from '../inputTypeSchemas/UserWhereUniqueInputSchema'
import { UserScalarFieldEnumSchema } from '../inputTypeSchemas/UserScalarFieldEnumSchema'
import { SessionFindManyArgsSchema } from "../outputTypeSchemas/SessionFindManyArgsSchema"
import { AccountFindManyArgsSchema } from "../outputTypeSchemas/AccountFindManyArgsSchema"
import { MemberFindManyArgsSchema } from "../outputTypeSchemas/MemberFindManyArgsSchema"
import { ApiKeyFindManyArgsSchema } from "../outputTypeSchemas/ApiKeyFindManyArgsSchema"
import { TwoFactorArgsSchema } from "../outputTypeSchemas/TwoFactorArgsSchema"
import { PasskeyFindManyArgsSchema } from "../outputTypeSchemas/PasskeyFindManyArgsSchema"
import { ArticleFindManyArgsSchema } from "../outputTypeSchemas/ArticleFindManyArgsSchema"
import { CollectionFindManyArgsSchema } from "../outputTypeSchemas/CollectionFindManyArgsSchema"
import { MediaFindManyArgsSchema } from "../outputTypeSchemas/MediaFindManyArgsSchema"
import { FavoriteJoinFindManyArgsSchema } from "../outputTypeSchemas/FavoriteJoinFindManyArgsSchema"
import { ReviewFindManyArgsSchema } from "../outputTypeSchemas/ReviewFindManyArgsSchema"
import { RegistryFindManyArgsSchema } from "../outputTypeSchemas/RegistryFindManyArgsSchema"
import { RegistryUserJoinFindManyArgsSchema } from "../outputTypeSchemas/RegistryUserJoinFindManyArgsSchema"
import { RegistryPurchaseJoinFindManyArgsSchema } from "../outputTypeSchemas/RegistryPurchaseJoinFindManyArgsSchema"
import { ReviewVoteJoinFindManyArgsSchema } from "../outputTypeSchemas/ReviewVoteJoinFindManyArgsSchema"
import { AddressFindManyArgsSchema } from "../outputTypeSchemas/AddressFindManyArgsSchema"
import { CartFindManyArgsSchema } from "../outputTypeSchemas/CartFindManyArgsSchema"
import { OrderFindManyArgsSchema } from "../outputTypeSchemas/OrderFindManyArgsSchema"
import { InvitationFindManyArgsSchema } from "../outputTypeSchemas/InvitationFindManyArgsSchema"
import { TeamMemberFindManyArgsSchema } from "../outputTypeSchemas/TeamMemberFindManyArgsSchema"
import { BrandFindManyArgsSchema } from "../outputTypeSchemas/BrandFindManyArgsSchema"
import { ProductFindManyArgsSchema } from "../outputTypeSchemas/ProductFindManyArgsSchema"
import { TaxonomyFindManyArgsSchema } from "../outputTypeSchemas/TaxonomyFindManyArgsSchema"
import { RegistryItemFindManyArgsSchema } from "../outputTypeSchemas/RegistryItemFindManyArgsSchema"
import { ProductCategoryFindManyArgsSchema } from "../outputTypeSchemas/ProductCategoryFindManyArgsSchema"
import { LocationFindManyArgsSchema } from "../outputTypeSchemas/LocationFindManyArgsSchema"
import { CastFindManyArgsSchema } from "../outputTypeSchemas/CastFindManyArgsSchema"
import { FandomFindManyArgsSchema } from "../outputTypeSchemas/FandomFindManyArgsSchema"
import { SeriesFindManyArgsSchema } from "../outputTypeSchemas/SeriesFindManyArgsSchema"
import { StoryFindManyArgsSchema } from "../outputTypeSchemas/StoryFindManyArgsSchema"
import { UserCountOutputTypeArgsSchema } from "../outputTypeSchemas/UserCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  image: z.boolean().optional(),
  phoneNumber: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  role: z.boolean().optional(),
  banned: z.boolean().optional(),
  banReason: z.boolean().optional(),
  banExpires: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  bio: z.boolean().optional(),
  expertise: z.boolean().optional(),
  isVerifiedAuthor: z.boolean().optional(),
  authorSince: z.boolean().optional(),
  preferences: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  suspensionDetails: z.boolean().optional(),
  sessions: z.union([z.boolean(),z.lazy(() => SessionFindManyArgsSchema)]).optional(),
  accounts: z.union([z.boolean(),z.lazy(() => AccountFindManyArgsSchema)]).optional(),
  members: z.union([z.boolean(),z.lazy(() => MemberFindManyArgsSchema)]).optional(),
  apiKeys: z.union([z.boolean(),z.lazy(() => ApiKeyFindManyArgsSchema)]).optional(),
  twoFactor: z.union([z.boolean(),z.lazy(() => TwoFactorArgsSchema)]).optional(),
  passkeys: z.union([z.boolean(),z.lazy(() => PasskeyFindManyArgsSchema)]).optional(),
  articles: z.union([z.boolean(),z.lazy(() => ArticleFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
  media: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoriteJoinFindManyArgsSchema)]).optional(),
  reviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  createdRegistries: z.union([z.boolean(),z.lazy(() => RegistryFindManyArgsSchema)]).optional(),
  registries: z.union([z.boolean(),z.lazy(() => RegistryUserJoinFindManyArgsSchema)]).optional(),
  purchases: z.union([z.boolean(),z.lazy(() => RegistryPurchaseJoinFindManyArgsSchema)]).optional(),
  reviewVotes: z.union([z.boolean(),z.lazy(() => ReviewVoteJoinFindManyArgsSchema)]).optional(),
  addresses: z.union([z.boolean(),z.lazy(() => AddressFindManyArgsSchema)]).optional(),
  carts: z.union([z.boolean(),z.lazy(() => CartFindManyArgsSchema)]).optional(),
  orders: z.union([z.boolean(),z.lazy(() => OrderFindManyArgsSchema)]).optional(),
  invitationsSent: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  teamMemberships: z.union([z.boolean(),z.lazy(() => TeamMemberFindManyArgsSchema)]).optional(),
  deletedArticles: z.union([z.boolean(),z.lazy(() => ArticleFindManyArgsSchema)]).optional(),
  deletedBrands: z.union([z.boolean(),z.lazy(() => BrandFindManyArgsSchema)]).optional(),
  deletedCollections: z.union([z.boolean(),z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
  deletedProducts: z.union([z.boolean(),z.lazy(() => ProductFindManyArgsSchema)]).optional(),
  deletedTaxonomies: z.union([z.boolean(),z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
  deletedReviews: z.union([z.boolean(),z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
  deletedRegistries: z.union([z.boolean(),z.lazy(() => RegistryFindManyArgsSchema)]).optional(),
  deletedRegistryItems: z.union([z.boolean(),z.lazy(() => RegistryItemFindManyArgsSchema)]).optional(),
  deletedMedia: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  deletedProductCategories: z.union([z.boolean(),z.lazy(() => ProductCategoryFindManyArgsSchema)]).optional(),
  deletedLocations: z.union([z.boolean(),z.lazy(() => LocationFindManyArgsSchema)]).optional(),
  deletedCasts: z.union([z.boolean(),z.lazy(() => CastFindManyArgsSchema)]).optional(),
  deletedFandoms: z.union([z.boolean(),z.lazy(() => FandomFindManyArgsSchema)]).optional(),
  deletedSeries: z.union([z.boolean(),z.lazy(() => SeriesFindManyArgsSchema)]).optional(),
  deletedStories: z.union([z.boolean(),z.lazy(() => StoryFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default UserFindManyArgsSchema;
