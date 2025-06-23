import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUpdateWithoutCartItemsInputSchema } from './RegistryUpdateWithoutCartItemsInputSchema';
import { RegistryUncheckedUpdateWithoutCartItemsInputSchema } from './RegistryUncheckedUpdateWithoutCartItemsInputSchema';
import { RegistryCreateWithoutCartItemsInputSchema } from './RegistryCreateWithoutCartItemsInputSchema';
import { RegistryUncheckedCreateWithoutCartItemsInputSchema } from './RegistryUncheckedCreateWithoutCartItemsInputSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryUpsertWithoutCartItemsInputSchema: z.ZodType<Prisma.RegistryUpsertWithoutCartItemsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => RegistryUpdateWithoutCartItemsInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutCartItemsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryCreateWithoutCartItemsInputSchema),
        z.lazy(() => RegistryUncheckedCreateWithoutCartItemsInputSchema),
      ]),
      where: z.lazy(() => RegistryWhereInputSchema).optional(),
    })
    .strict();

export default RegistryUpsertWithoutCartItemsInputSchema;
