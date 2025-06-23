import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereInputSchema } from './RegistryItemWhereInputSchema';
import { RegistryItemUpdateWithoutPurchasesInputSchema } from './RegistryItemUpdateWithoutPurchasesInputSchema';
import { RegistryItemUncheckedUpdateWithoutPurchasesInputSchema } from './RegistryItemUncheckedUpdateWithoutPurchasesInputSchema';

export const RegistryItemUpdateToOneWithWhereWithoutPurchasesInputSchema: z.ZodType<Prisma.RegistryItemUpdateToOneWithWhereWithoutPurchasesInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => RegistryItemUpdateWithoutPurchasesInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateWithoutPurchasesInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpdateToOneWithWhereWithoutPurchasesInputSchema;
