import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutOrdersInputSchema } from './UserCreateWithoutOrdersInputSchema';
import { UserUncheckedCreateWithoutOrdersInputSchema } from './UserUncheckedCreateWithoutOrdersInputSchema';

export const UserCreateOrConnectWithoutOrdersInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutOrdersInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutOrdersInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutOrdersInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutOrdersInputSchema;
