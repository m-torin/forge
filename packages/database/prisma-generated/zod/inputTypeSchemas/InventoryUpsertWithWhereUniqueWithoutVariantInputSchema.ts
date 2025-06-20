import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryUpdateWithoutVariantInputSchema } from './InventoryUpdateWithoutVariantInputSchema';
import { InventoryUncheckedUpdateWithoutVariantInputSchema } from './InventoryUncheckedUpdateWithoutVariantInputSchema';
import { InventoryCreateWithoutVariantInputSchema } from './InventoryCreateWithoutVariantInputSchema';
import { InventoryUncheckedCreateWithoutVariantInputSchema } from './InventoryUncheckedCreateWithoutVariantInputSchema';

export const InventoryUpsertWithWhereUniqueWithoutVariantInputSchema: z.ZodType<Prisma.InventoryUpsertWithWhereUniqueWithoutVariantInput> = z.object({
  where: z.lazy(() => InventoryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => InventoryUpdateWithoutVariantInputSchema),z.lazy(() => InventoryUncheckedUpdateWithoutVariantInputSchema) ]),
  create: z.union([ z.lazy(() => InventoryCreateWithoutVariantInputSchema),z.lazy(() => InventoryUncheckedCreateWithoutVariantInputSchema) ]),
}).strict();

export default InventoryUpsertWithWhereUniqueWithoutVariantInputSchema;
