import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinUpdateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUpdateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedUpdateWithoutPurchaserInputSchema';

export const RegistryPurchaseJoinUpdateWithWhereUniqueWithoutPurchaserInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpdateWithWhereUniqueWithoutPurchaserInput> = z.object({
  where: z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedUpdateWithoutPurchaserInputSchema) ]),
}).strict();

export default RegistryPurchaseJoinUpdateWithWhereUniqueWithoutPurchaserInputSchema;
