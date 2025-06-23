import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUpdateWithoutOrderItemsInputSchema } from './RegistryUpdateWithoutOrderItemsInputSchema';
import { RegistryUncheckedUpdateWithoutOrderItemsInputSchema } from './RegistryUncheckedUpdateWithoutOrderItemsInputSchema';
import { RegistryCreateWithoutOrderItemsInputSchema } from './RegistryCreateWithoutOrderItemsInputSchema';
import { RegistryUncheckedCreateWithoutOrderItemsInputSchema } from './RegistryUncheckedCreateWithoutOrderItemsInputSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryUpsertWithoutOrderItemsInputSchema: z.ZodType<Prisma.RegistryUpsertWithoutOrderItemsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => RegistryUpdateWithoutOrderItemsInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutOrderItemsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryCreateWithoutOrderItemsInputSchema),
        z.lazy(() => RegistryUncheckedCreateWithoutOrderItemsInputSchema),
      ]),
      where: z.lazy(() => RegistryWhereInputSchema).optional(),
    })
    .strict();

export default RegistryUpsertWithoutOrderItemsInputSchema;
