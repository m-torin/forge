import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryUpdateWithoutProductInputSchema } from './InventoryUpdateWithoutProductInputSchema';
import { InventoryUncheckedUpdateWithoutProductInputSchema } from './InventoryUncheckedUpdateWithoutProductInputSchema';
import { InventoryCreateWithoutProductInputSchema } from './InventoryCreateWithoutProductInputSchema';
import { InventoryUncheckedCreateWithoutProductInputSchema } from './InventoryUncheckedCreateWithoutProductInputSchema';

export const InventoryUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.InventoryUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => InventoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InventoryUpdateWithoutProductInputSchema),z.lazy(() => InventoryUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => InventoryCreateWithoutProductInputSchema),z.lazy(() => InventoryUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default InventoryUpsertWithWhereUniqueWithoutProductInputSchema;
