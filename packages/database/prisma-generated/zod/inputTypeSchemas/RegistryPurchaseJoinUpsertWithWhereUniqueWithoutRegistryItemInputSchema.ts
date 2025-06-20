import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinUpdateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUpdateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedUpdateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema';

export const RegistryPurchaseJoinUpsertWithWhereUniqueWithoutRegistryItemInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpsertWithWhereUniqueWithoutRegistryItemInput> = z.object({
  where: z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedUpdateWithoutRegistryItemInputSchema) ]),
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema) ]),
}).strict();

export default RegistryPurchaseJoinUpsertWithWhereUniqueWithoutRegistryItemInputSchema;
