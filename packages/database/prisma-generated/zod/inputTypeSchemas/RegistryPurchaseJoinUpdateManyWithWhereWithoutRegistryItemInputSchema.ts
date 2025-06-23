import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinScalarWhereInputSchema } from './RegistryPurchaseJoinScalarWhereInputSchema';
import { RegistryPurchaseJoinUpdateManyMutationInputSchema } from './RegistryPurchaseJoinUpdateManyMutationInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateManyWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedUpdateManyWithoutRegistryItemInputSchema';

export const RegistryPurchaseJoinUpdateManyWithWhereWithoutRegistryItemInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpdateManyWithWhereWithoutRegistryItemInput> =
  z
    .object({
      where: z.lazy(() => RegistryPurchaseJoinScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryPurchaseJoinUpdateManyMutationInputSchema),
        z.lazy(() => RegistryPurchaseJoinUncheckedUpdateManyWithoutRegistryItemInputSchema),
      ]),
    })
    .strict();

export default RegistryPurchaseJoinUpdateManyWithWhereWithoutRegistryItemInputSchema;
