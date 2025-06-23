import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutCartsInputSchema } from './UserCreateWithoutCartsInputSchema';
import { UserUncheckedCreateWithoutCartsInputSchema } from './UserUncheckedCreateWithoutCartsInputSchema';
import { UserCreateOrConnectWithoutCartsInputSchema } from './UserCreateOrConnectWithoutCartsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutCartsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutCartsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutCartsInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutCartsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutCartsInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutCartsInputSchema;
