import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryUpdateWithoutProductInputSchema } from './InventoryUpdateWithoutProductInputSchema';
import { InventoryUncheckedUpdateWithoutProductInputSchema } from './InventoryUncheckedUpdateWithoutProductInputSchema';

export const InventoryUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.InventoryUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => InventoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => InventoryUpdateWithoutProductInputSchema),z.lazy(() => InventoryUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export default InventoryUpdateWithWhereUniqueWithoutProductInputSchema;
