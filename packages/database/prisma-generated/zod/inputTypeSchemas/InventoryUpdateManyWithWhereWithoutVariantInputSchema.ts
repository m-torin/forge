import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryScalarWhereInputSchema } from './InventoryScalarWhereInputSchema';
import { InventoryUpdateManyMutationInputSchema } from './InventoryUpdateManyMutationInputSchema';
import { InventoryUncheckedUpdateManyWithoutVariantInputSchema } from './InventoryUncheckedUpdateManyWithoutVariantInputSchema';

export const InventoryUpdateManyWithWhereWithoutVariantInputSchema: z.ZodType<Prisma.InventoryUpdateManyWithWhereWithoutVariantInput> = z.object({
  where: z.lazy(() => InventoryScalarWhereInputSchema),
  data: z.union([ z.lazy(() => InventoryUpdateManyMutationInputSchema),z.lazy(() => InventoryUncheckedUpdateManyWithoutVariantInputSchema) ]),
}).strict();

export default InventoryUpdateManyWithWhereWithoutVariantInputSchema;
