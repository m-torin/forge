import type { Prisma } from '../../client';

import { z } from 'zod';

export const InventoryProductIdVariantIdLocationIdCompoundUniqueInputSchema: z.ZodType<Prisma.InventoryProductIdVariantIdLocationIdCompoundUniqueInput> =
  z
    .object({
      productId: z.string(),
      variantId: z.string(),
      locationId: z.string(),
    })
    .strict();

export default InventoryProductIdVariantIdLocationIdCompoundUniqueInputSchema;
