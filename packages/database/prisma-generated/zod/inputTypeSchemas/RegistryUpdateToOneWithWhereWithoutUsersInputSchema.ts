import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { RegistryUpdateWithoutUsersInputSchema } from './RegistryUpdateWithoutUsersInputSchema';
import { RegistryUncheckedUpdateWithoutUsersInputSchema } from './RegistryUncheckedUpdateWithoutUsersInputSchema';

export const RegistryUpdateToOneWithWhereWithoutUsersInputSchema: z.ZodType<Prisma.RegistryUpdateToOneWithWhereWithoutUsersInput> =
  z
    .object({
      where: z.lazy(() => RegistryWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => RegistryUpdateWithoutUsersInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutUsersInputSchema),
      ]),
    })
    .strict();

export default RegistryUpdateToOneWithWhereWithoutUsersInputSchema;
