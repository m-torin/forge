import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinCreateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema';

export const RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInput> = z.object({
  where: z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema) ]),
}).strict();

export default RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema;
