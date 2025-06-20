import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryUpdateWithoutVariantInputSchema } from './InventoryUpdateWithoutVariantInputSchema';
import { InventoryUncheckedUpdateWithoutVariantInputSchema } from './InventoryUncheckedUpdateWithoutVariantInputSchema';

export const InventoryUpdateWithWhereUniqueWithoutVariantInputSchema: z.ZodType<Prisma.InventoryUpdateWithWhereUniqueWithoutVariantInput> = z.object({
  where: z.lazy(() => InventoryWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => InventoryUpdateWithoutVariantInputSchema),z.lazy(() => InventoryUncheckedUpdateWithoutVariantInputSchema) ]),
}).strict();

export default InventoryUpdateWithWhereUniqueWithoutVariantInputSchema;
