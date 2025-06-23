import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutUsersInputSchema } from './RegistryCreateWithoutUsersInputSchema';
import { RegistryUncheckedCreateWithoutUsersInputSchema } from './RegistryUncheckedCreateWithoutUsersInputSchema';
import { RegistryCreateOrConnectWithoutUsersInputSchema } from './RegistryCreateOrConnectWithoutUsersInputSchema';
import { RegistryUpsertWithoutUsersInputSchema } from './RegistryUpsertWithoutUsersInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateToOneWithWhereWithoutUsersInputSchema } from './RegistryUpdateToOneWithWhereWithoutUsersInputSchema';
import { RegistryUpdateWithoutUsersInputSchema } from './RegistryUpdateWithoutUsersInputSchema';
import { RegistryUncheckedUpdateWithoutUsersInputSchema } from './RegistryUncheckedUpdateWithoutUsersInputSchema';

export const RegistryUpdateOneRequiredWithoutUsersNestedInputSchema: z.ZodType<Prisma.RegistryUpdateOneRequiredWithoutUsersNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutUsersInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutUsersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutUsersInputSchema).optional(),
      upsert: z.lazy(() => RegistryUpsertWithoutUsersInputSchema).optional(),
      connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => RegistryUpdateToOneWithWhereWithoutUsersInputSchema),
          z.lazy(() => RegistryUpdateWithoutUsersInputSchema),
          z.lazy(() => RegistryUncheckedUpdateWithoutUsersInputSchema),
        ])
        .optional(),
    })
    .strict();

export default RegistryUpdateOneRequiredWithoutUsersNestedInputSchema;
