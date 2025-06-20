import type { Prisma } from '../../client';

import { z } from 'zod';

export const ProductIdentifiersProductIdPdpJoinIdCollectionIdBrandIdCompoundUniqueInputSchema: z.ZodType<Prisma.ProductIdentifiersProductIdPdpJoinIdCollectionIdBrandIdCompoundUniqueInput> = z.object({
  productId: z.string(),
  pdpJoinId: z.string(),
  collectionId: z.string(),
  brandId: z.string()
}).strict();

export default ProductIdentifiersProductIdPdpJoinIdCollectionIdBrandIdCompoundUniqueInputSchema;
