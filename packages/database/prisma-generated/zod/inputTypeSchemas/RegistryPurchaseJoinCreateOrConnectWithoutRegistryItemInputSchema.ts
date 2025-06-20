import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema';

export const RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInput> = z.object({
  where: z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema) ]),
}).strict();

export default RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema;
