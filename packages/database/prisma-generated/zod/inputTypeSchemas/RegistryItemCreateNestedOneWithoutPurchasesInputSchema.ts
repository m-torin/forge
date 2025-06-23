import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutPurchasesInputSchema } from './RegistryItemCreateWithoutPurchasesInputSchema';
import { RegistryItemUncheckedCreateWithoutPurchasesInputSchema } from './RegistryItemUncheckedCreateWithoutPurchasesInputSchema';
import { RegistryItemCreateOrConnectWithoutPurchasesInputSchema } from './RegistryItemCreateOrConnectWithoutPurchasesInputSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';

export const RegistryItemCreateNestedOneWithoutPurchasesInputSchema: z.ZodType<Prisma.RegistryItemCreateNestedOneWithoutPurchasesInput> =
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
      connect: z.lazy(() => RegistryItemWhereUniqueInputSchema).optional(),
    })
    .strict();

export default RegistryItemCreateNestedOneWithoutPurchasesInputSchema;
