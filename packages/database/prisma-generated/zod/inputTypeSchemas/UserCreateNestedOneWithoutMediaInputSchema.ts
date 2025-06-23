import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutMediaInputSchema } from './UserCreateWithoutMediaInputSchema';
import { UserUncheckedCreateWithoutMediaInputSchema } from './UserUncheckedCreateWithoutMediaInputSchema';
import { UserCreateOrConnectWithoutMediaInputSchema } from './UserCreateOrConnectWithoutMediaInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutMediaInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => UserCreateWithoutMediaInputSchema),
          z.lazy(() => UserUncheckedCreateWithoutMediaInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMediaInputSchema).optional(),
      connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
    })
    .strict();

export default UserCreateNestedOneWithoutMediaInputSchema;
