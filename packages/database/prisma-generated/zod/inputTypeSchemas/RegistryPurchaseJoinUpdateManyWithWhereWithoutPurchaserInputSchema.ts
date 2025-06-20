import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinScalarWhereInputSchema } from './RegistryPurchaseJoinScalarWhereInputSchema';
import { RegistryPurchaseJoinUpdateManyMutationInputSchema } from './RegistryPurchaseJoinUpdateManyMutationInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateManyWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedUpdateManyWithoutPurchaserInputSchema';

export const RegistryPurchaseJoinUpdateManyWithWhereWithoutPurchaserInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpdateManyWithWhereWithoutPurchaserInput> = z.object({
  where: z.lazy(() => RegistryPurchaseJoinScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateManyMutationInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedUpdateManyWithoutPurchaserInputSchema) ]),
}).strict();

export default RegistryPurchaseJoinUpdateManyWithWhereWithoutPurchaserInputSchema;
