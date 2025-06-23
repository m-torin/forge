import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryCreateWithoutVariantInputSchema } from './InventoryCreateWithoutVariantInputSchema';
import { InventoryUncheckedCreateWithoutVariantInputSchema } from './InventoryUncheckedCreateWithoutVariantInputSchema';

export const InventoryCreateOrConnectWithoutVariantInputSchema: z.ZodType<Prisma.InventoryCreateOrConnectWithoutVariantInput> =
  z
    .object({
      where: z.lazy(() => InventoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => InventoryCreateWithoutVariantInputSchema),
        z.lazy(() => InventoryUncheckedCreateWithoutVariantInputSchema),
      ]),
    })
    .strict();

export default InventoryCreateOrConnectWithoutVariantInputSchema;
