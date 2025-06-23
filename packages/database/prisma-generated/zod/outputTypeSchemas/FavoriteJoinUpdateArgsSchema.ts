import { z } from 'zod';
import type { Prisma } from '../../client';
import { FavoriteJoinIncludeSchema } from '../inputTypeSchemas/FavoriteJoinIncludeSchema';
import { FavoriteJoinUpdateInputSchema } from '../inputTypeSchemas/FavoriteJoinUpdateInputSchema';
import { FavoriteJoinUncheckedUpdateInputSchema } from '../inputTypeSchemas/FavoriteJoinUncheckedUpdateInputSchema';
import { FavoriteJoinWhereUniqueInputSchema } from '../inputTypeSchemas/FavoriteJoinWhereUniqueInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { CollectionArgsSchema } from '../outputTypeSchemas/CollectionArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const FavoriteJoinSelectSchema: z.ZodType<Prisma.FavoriteJoinSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    userId: z.boolean().optional(),
    productId: z.boolean().optional(),
    collectionId: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    collection: z.union([z.boolean(), z.lazy(() => CollectionArgsSchema)]).optional(),
  })
  .strict();

export const FavoriteJoinUpdateArgsSchema: z.ZodType<Prisma.FavoriteJoinUpdateArgs> = z
  .object({
    select: FavoriteJoinSelectSchema.optional(),
    include: z.lazy(() => FavoriteJoinIncludeSchema).optional(),
    data: z.union([FavoriteJoinUpdateInputSchema, FavoriteJoinUncheckedUpdateInputSchema]),
    where: FavoriteJoinWhereUniqueInputSchema,
  })
  .strict();

export default FavoriteJoinUpdateArgsSchema;
