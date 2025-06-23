import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemUpdateWithoutPurchasesInputSchema } from './RegistryItemUpdateWithoutPurchasesInputSchema';
import { RegistryItemUncheckedUpdateWithoutPurchasesInputSchema } from './RegistryItemUncheckedUpdateWithoutPurchasesInputSchema';
import { RegistryItemCreateWithoutPurchasesInputSchema } from './RegistryItemCreateWithoutPurchasesInputSchema';
import { RegistryItemUncheckedCreateWithoutPurchasesInputSchema } from './RegistryItemUncheckedCreateWithoutPurchasesInputSchema';
import { RegistryItemWhereInputSchema } from './RegistryItemWhereInputSchema';

export const RegistryItemUpsertWithoutPurchasesInputSchema: z.ZodType<Prisma.RegistryItemUpsertWithoutPurchasesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => RegistryItemUpdateWithoutPurchasesInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateWithoutPurchasesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryItemCreateWithoutPurchasesInputSchema),
        z.lazy(() => RegistryItemUncheckedCreateWithoutPurchasesInputSchema),
      ]),
      where: z.lazy(() => RegistryItemWhereInputSchema).optional(),
    })
    .strict();

export default RegistryItemUpsertWithoutPurchasesInputSchema;
