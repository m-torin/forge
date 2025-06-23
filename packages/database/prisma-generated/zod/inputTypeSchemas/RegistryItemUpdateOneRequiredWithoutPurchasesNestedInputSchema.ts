import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutPurchasesInputSchema } from './RegistryItemCreateWithoutPurchasesInputSchema';
import { RegistryItemUncheckedCreateWithoutPurchasesInputSchema } from './RegistryItemUncheckedCreateWithoutPurchasesInputSchema';
import { RegistryItemCreateOrConnectWithoutPurchasesInputSchema } from './RegistryItemCreateOrConnectWithoutPurchasesInputSchema';
import { RegistryItemUpsertWithoutPurchasesInputSchema } from './RegistryItemUpsertWithoutPurchasesInputSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateToOneWithWhereWithoutPurchasesInputSchema } from './RegistryItemUpdateToOneWithWhereWithoutPurchasesInputSchema';
import { RegistryItemUpdateWithoutPurchasesInputSchema } from './RegistryItemUpdateWithoutPurchasesInputSchema';
import { RegistryItemUncheckedUpdateWithoutPurchasesInputSchema } from './RegistryItemUncheckedUpdateWithoutPurchasesInputSchema';

export const RegistryItemUpdateOneRequiredWithoutPurchasesNestedInputSchema: z.ZodType<Prisma.RegistryItemUpdateOneRequiredWithoutPurchasesNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryItemCreateWithoutPurchasesInputSchema),
          z.lazy(() => RegistryItemUncheckedCreateWithoutPurchasesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => RegistryItemCreateOrConnectWithoutPurchasesInputSchema)
        .optional(),
      upsert: z.lazy(() => RegistryItemUpsertWithoutPurchasesInputSchema).optional(),
      connect: z.lazy(() => RegistryItemWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => RegistryItemUpdateToOneWithWhereWithoutPurchasesInputSchema),
          z.lazy(() => RegistryItemUpdateWithoutPurchasesInputSchema),
          z.lazy(() => RegistryItemUncheckedUpdateWithoutPurchasesInputSchema),
        ])
        .optional(),
    })
    .strict();

export default RegistryItemUpdateOneRequiredWithoutPurchasesNestedInputSchema;
