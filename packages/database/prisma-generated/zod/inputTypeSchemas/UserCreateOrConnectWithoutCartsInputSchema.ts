import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutCartsInputSchema } from './UserCreateWithoutCartsInputSchema';
import { UserUncheckedCreateWithoutCartsInputSchema } from './UserUncheckedCreateWithoutCartsInputSchema';

export const UserCreateOrConnectWithoutCartsInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutCartsInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutCartsInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutCartsInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutCartsInputSchema;
