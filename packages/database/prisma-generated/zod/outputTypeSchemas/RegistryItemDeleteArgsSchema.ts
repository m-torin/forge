import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemIncludeSchema } from '../inputTypeSchemas/RegistryItemIncludeSchema';
import { RegistryItemWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryItemWhereUniqueInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { RegistryArgsSchema } from '../outputTypeSchemas/RegistryArgsSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { CollectionArgsSchema } from '../outputTypeSchemas/CollectionArgsSchema';
import { RegistryPurchaseJoinFindManyArgsSchema } from '../outputTypeSchemas/RegistryPurchaseJoinFindManyArgsSchema';
import { RegistryItemCountOutputTypeArgsSchema } from '../outputTypeSchemas/RegistryItemCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RegistryItemSelectSchema: z.ZodType<Prisma.RegistryItemSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    quantity: z.boolean().optional(),
    priority: z.boolean().optional(),
    notes: z.boolean().optional(),
    purchased: z.boolean().optional(),
    registryId: z.boolean().optional(),
    productId: z.boolean().optional(),
    collectionId: z.boolean().optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    registry: z.union([z.boolean(), z.lazy(() => RegistryArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    collection: z.union([z.boolean(), z.lazy(() => CollectionArgsSchema)]).optional(),
    purchases: z
      .union([z.boolean(), z.lazy(() => RegistryPurchaseJoinFindManyArgsSchema)])
      .optional(),
    _count: z.union([z.boolean(), z.lazy(() => RegistryItemCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const RegistryItemDeleteArgsSchema: z.ZodType<Prisma.RegistryItemDeleteArgs> = z
  .object({
    select: RegistryItemSelectSchema.optional(),
    include: z.lazy(() => RegistryItemIncludeSchema).optional(),
    where: RegistryItemWhereUniqueInputSchema,
  })
  .strict();

export default RegistryItemDeleteArgsSchema;
