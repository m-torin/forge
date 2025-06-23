import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUpdateWithoutItemsInputSchema } from './RegistryUpdateWithoutItemsInputSchema';
import { RegistryUncheckedUpdateWithoutItemsInputSchema } from './RegistryUncheckedUpdateWithoutItemsInputSchema';
import { RegistryCreateWithoutItemsInputSchema } from './RegistryCreateWithoutItemsInputSchema';
import { RegistryUncheckedCreateWithoutItemsInputSchema } from './RegistryUncheckedCreateWithoutItemsInputSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryUpsertWithoutItemsInputSchema: z.ZodType<Prisma.RegistryUpsertWithoutItemsInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => RegistryUpdateWithoutItemsInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutItemsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryCreateWithoutItemsInputSchema),
        z.lazy(() => RegistryUncheckedCreateWithoutItemsInputSchema),
      ]),
      where: z.lazy(() => RegistryWhereInputSchema).optional(),
    })
    .strict();

export default RegistryUpsertWithoutItemsInputSchema;
