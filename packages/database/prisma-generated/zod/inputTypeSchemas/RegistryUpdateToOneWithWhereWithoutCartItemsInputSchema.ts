import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { RegistryUpdateWithoutCartItemsInputSchema } from './RegistryUpdateWithoutCartItemsInputSchema';
import { RegistryUncheckedUpdateWithoutCartItemsInputSchema } from './RegistryUncheckedUpdateWithoutCartItemsInputSchema';

export const RegistryUpdateToOneWithWhereWithoutCartItemsInputSchema: z.ZodType<Prisma.RegistryUpdateToOneWithWhereWithoutCartItemsInput> =
  z
    .object({
      where: z.lazy(() => RegistryWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => RegistryUpdateWithoutCartItemsInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutCartItemsInputSchema),
      ]),
    })
    .strict();

export default RegistryUpdateToOneWithWhereWithoutCartItemsInputSchema;
