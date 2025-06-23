import type { Prisma } from '../../client';

import { z } from 'zod';

export const RegistryItemRegistryIdProductIdCollectionIdCompoundUniqueInputSchema: z.ZodType<Prisma.RegistryItemRegistryIdProductIdCollectionIdCompoundUniqueInput> =
  z
    .object({
      registryId: z.string(),
      productId: z.string(),
      collectionId: z.string(),
    })
    .strict();

export default RegistryItemRegistryIdProductIdCollectionIdCompoundUniqueInputSchema;
