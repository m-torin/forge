import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryScalarWhereInputSchema } from './InventoryScalarWhereInputSchema';
import { InventoryUpdateManyMutationInputSchema } from './InventoryUpdateManyMutationInputSchema';
import { InventoryUncheckedUpdateManyWithoutProductInputSchema } from './InventoryUncheckedUpdateManyWithoutProductInputSchema';

export const InventoryUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.InventoryUpdateManyWithWhereWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => InventoryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => InventoryUpdateManyMutationInputSchema),
        z.lazy(() => InventoryUncheckedUpdateManyWithoutProductInputSchema),
      ]),
    })
    .strict();

export default InventoryUpdateManyWithWhereWithoutProductInputSchema;
