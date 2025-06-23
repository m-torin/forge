import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutOrderItemsInputSchema } from './RegistryCreateWithoutOrderItemsInputSchema';
import { RegistryUncheckedCreateWithoutOrderItemsInputSchema } from './RegistryUncheckedCreateWithoutOrderItemsInputSchema';
import { RegistryCreateOrConnectWithoutOrderItemsInputSchema } from './RegistryCreateOrConnectWithoutOrderItemsInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';

export const RegistryCreateNestedOneWithoutOrderItemsInputSchema: z.ZodType<Prisma.RegistryCreateNestedOneWithoutOrderItemsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutOrderItemsInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutOrderItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutOrderItemsInputSchema).optional(),
      connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional(),
    })
    .strict();

export default RegistryCreateNestedOneWithoutOrderItemsInputSchema;
