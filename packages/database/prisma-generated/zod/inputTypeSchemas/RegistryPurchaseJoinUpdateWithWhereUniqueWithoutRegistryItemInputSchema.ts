import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinUpdateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUpdateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedUpdateWithoutRegistryItemInputSchema';

export const RegistryPurchaseJoinUpdateWithWhereUniqueWithoutRegistryItemInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpdateWithWhereUniqueWithoutRegistryItemInput> = z.object({
  where: z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedUpdateWithoutRegistryItemInputSchema) ]),
}).strict();

export default RegistryPurchaseJoinUpdateWithWhereUniqueWithoutRegistryItemInputSchema;
