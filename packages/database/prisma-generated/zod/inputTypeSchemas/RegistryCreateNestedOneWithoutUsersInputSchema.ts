import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutUsersInputSchema } from './RegistryCreateWithoutUsersInputSchema';
import { RegistryUncheckedCreateWithoutUsersInputSchema } from './RegistryUncheckedCreateWithoutUsersInputSchema';
import { RegistryCreateOrConnectWithoutUsersInputSchema } from './RegistryCreateOrConnectWithoutUsersInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';

export const RegistryCreateNestedOneWithoutUsersInputSchema: z.ZodType<Prisma.RegistryCreateNestedOneWithoutUsersInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutUsersInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutUsersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutUsersInputSchema).optional(),
      connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional(),
    })
    .strict();

export default RegistryCreateNestedOneWithoutUsersInputSchema;
