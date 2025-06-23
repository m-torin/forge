import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryCreateWithoutOrderItemsInputSchema } from './RegistryCreateWithoutOrderItemsInputSchema';
import { RegistryUncheckedCreateWithoutOrderItemsInputSchema } from './RegistryUncheckedCreateWithoutOrderItemsInputSchema';

export const RegistryCreateOrConnectWithoutOrderItemsInputSchema: z.ZodType<Prisma.RegistryCreateOrConnectWithoutOrderItemsInput> =
  z
    .object({
      where: z.lazy(() => RegistryWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => RegistryCreateWithoutOrderItemsInputSchema),
        z.lazy(() => RegistryUncheckedCreateWithoutOrderItemsInputSchema),
      ]),
    })
    .strict();

export default RegistryCreateOrConnectWithoutOrderItemsInputSchema;
