import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUpdateWithoutUsersInputSchema } from './RegistryUpdateWithoutUsersInputSchema';
import { RegistryUncheckedUpdateWithoutUsersInputSchema } from './RegistryUncheckedUpdateWithoutUsersInputSchema';
import { RegistryCreateWithoutUsersInputSchema } from './RegistryCreateWithoutUsersInputSchema';
import { RegistryUncheckedCreateWithoutUsersInputSchema } from './RegistryUncheckedCreateWithoutUsersInputSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryUpsertWithoutUsersInputSchema: z.ZodType<Prisma.RegistryUpsertWithoutUsersInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => RegistryUpdateWithoutUsersInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutUsersInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryCreateWithoutUsersInputSchema),
        z.lazy(() => RegistryUncheckedCreateWithoutUsersInputSchema),
      ]),
      where: z.lazy(() => RegistryWhereInputSchema).optional(),
    })
    .strict();

export default RegistryUpsertWithoutUsersInputSchema;
