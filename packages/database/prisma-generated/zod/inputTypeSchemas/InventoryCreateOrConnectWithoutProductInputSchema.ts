import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryCreateWithoutProductInputSchema } from './InventoryCreateWithoutProductInputSchema';
import { InventoryUncheckedCreateWithoutProductInputSchema } from './InventoryUncheckedCreateWithoutProductInputSchema';

export const InventoryCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.InventoryCreateOrConnectWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => InventoryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => InventoryCreateWithoutProductInputSchema),
        z.lazy(() => InventoryUncheckedCreateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default InventoryCreateOrConnectWithoutProductInputSchema;
