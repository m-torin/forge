import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { RegistryUpdateWithoutOrderItemsInputSchema } from './RegistryUpdateWithoutOrderItemsInputSchema';
import { RegistryUncheckedUpdateWithoutOrderItemsInputSchema } from './RegistryUncheckedUpdateWithoutOrderItemsInputSchema';

export const RegistryUpdateToOneWithWhereWithoutOrderItemsInputSchema: z.ZodType<Prisma.RegistryUpdateToOneWithWhereWithoutOrderItemsInput> =
  z
    .object({
      where: z.lazy(() => RegistryWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => RegistryUpdateWithoutOrderItemsInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutOrderItemsInputSchema),
      ]),
    })
    .strict();

export default RegistryUpdateToOneWithWhereWithoutOrderItemsInputSchema;
