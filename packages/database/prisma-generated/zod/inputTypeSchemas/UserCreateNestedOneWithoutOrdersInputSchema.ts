import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutOrdersInputSchema } from './UserCreateWithoutOrdersInputSchema';
import { UserUncheckedCreateWithoutOrdersInputSchema } from './UserUncheckedCreateWithoutOrdersInputSchema';
import { UserCreateOrConnectWithoutOrdersInputSchema } from './UserCreateOrConnectWithoutOrdersInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutOrdersInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutOrdersInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutOrdersInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutOrdersInputSchema;
