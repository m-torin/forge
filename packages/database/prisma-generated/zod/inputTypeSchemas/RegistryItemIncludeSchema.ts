import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { RegistryArgsSchema } from '../outputTypeSchemas/RegistryArgsSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { CollectionArgsSchema } from '../outputTypeSchemas/CollectionArgsSchema';
import { RegistryPurchaseJoinFindManyArgsSchema } from '../outputTypeSchemas/RegistryPurchaseJoinFindManyArgsSchema';
import { RegistryItemCountOutputTypeArgsSchema } from '../outputTypeSchemas/RegistryItemCountOutputTypeArgsSchema';

export const RegistryItemIncludeSchema: z.ZodType<Prisma.RegistryItemInclude> = z
  .object({
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

export default RegistryItemIncludeSchema;
