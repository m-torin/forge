import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryIncludeSchema } from '../inputTypeSchemas/RegistryIncludeSchema'
import { RegistryWhereInputSchema } from '../inputTypeSchemas/RegistryWhereInputSchema'
import { RegistryOrderByWithRelationInputSchema } from '../inputTypeSchemas/RegistryOrderByWithRelationInputSchema'
import { RegistryWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryWhereUniqueInputSchema'
import { RegistryScalarFieldEnumSchema } from '../inputTypeSchemas/RegistryScalarFieldEnumSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { RegistryItemFindManyArgsSchema } from "../outputTypeSchemas/RegistryItemFindManyArgsSchema"
import { RegistryUserJoinFindManyArgsSchema } from "../outputTypeSchemas/RegistryUserJoinFindManyArgsSchema"
import { CartItemFindManyArgsSchema } from "../outputTypeSchemas/CartItemFindManyArgsSchema"
import { OrderItemFindManyArgsSchema } from "../outputTypeSchemas/OrderItemFindManyArgsSchema"
import { RegistryCountOutputTypeArgsSchema } from "../outputTypeSchemas/RegistryCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RegistrySelectSchema: z.ZodType<Prisma.RegistrySelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  deletedAt: z.boolean().optional(),
  deletedById: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  type: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  eventDate: z.boolean().optional(),
  createdByUserId: z.boolean().optional(),
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  createdByUser: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  items: z.union([z.boolean(),z.lazy(() => RegistryItemFindManyArgsSchema)]).optional(),
  users: z.union([z.boolean(),z.lazy(() => RegistryUserJoinFindManyArgsSchema)]).optional(),
  cartItems: z.union([z.boolean(),z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
  orderItems: z.union([z.boolean(),z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => RegistryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const RegistryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RegistryFindFirstOrThrowArgs> = z.object({
  select: RegistrySelectSchema.optional(),
  include: z.lazy(() => RegistryIncludeSchema).optional(),
  where: RegistryWhereInputSchema.optional(),
  orderBy: z.union([ RegistryOrderByWithRelationInputSchema.array(),RegistryOrderByWithRelationInputSchema ]).optional(),
  cursor: RegistryWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ RegistryScalarFieldEnumSchema,RegistryScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default RegistryFindFirstOrThrowArgsSchema;
