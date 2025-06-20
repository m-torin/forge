import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinUpdateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUpdateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedUpdateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinCreateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema';

export const RegistryPurchaseJoinUpsertWithWhereUniqueWithoutPurchaserInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpsertWithWhereUniqueWithoutPurchaserInput> = z.object({
  where: z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedUpdateWithoutPurchaserInputSchema) ]),
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema) ]),
}).strict();

export default RegistryPurchaseJoinUpsertWithWhereUniqueWithoutPurchaserInputSchema;
