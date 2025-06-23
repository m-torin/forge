import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutOrdersInputSchema } from './UserCreateWithoutOrdersInputSchema';
import { UserUncheckedCreateWithoutOrdersInputSchema } from './UserUncheckedCreateWithoutOrdersInputSchema';
import { UserCreateOrConnectWithoutOrdersInputSchema } from './UserCreateOrConnectWithoutOrdersInputSchema';
import { UserUpsertWithoutOrdersInputSchema } from './UserUpsertWithoutOrdersInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutOrdersInputSchema } from './UserUpdateToOneWithWhereWithoutOrdersInputSchema';
import { UserUpdateWithoutOrdersInputSchema } from './UserUpdateWithoutOrdersInputSchema';
import { UserUncheckedUpdateWithoutOrdersInputSchema } from './UserUncheckedUpdateWithoutOrdersInputSchema';

export const UserUpdateOneWithoutOrdersNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutOrdersNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutOrdersInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrdersInputSchema).optional(),
      upsert: z.lazy(() => UserUpsertWithoutOrdersInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => UserUpdateToOneWithWhereWithoutOrdersInputSchema),
          z.lazy(() => UserUpdateWithoutOrdersInputSchema),
          z.lazy(() => UserUncheckedUpdateWithoutOrdersInputSchema),
        ])
        .optional(),
    })
    .strict();

export default UserUpdateOneWithoutOrdersNestedInputSchema;
