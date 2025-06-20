import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutMediaInputSchema } from './UserCreateWithoutMediaInputSchema';
import { UserUncheckedCreateWithoutMediaInputSchema } from './UserUncheckedCreateWithoutMediaInputSchema';
import { UserCreateOrConnectWithoutMediaInputSchema } from './UserCreateOrConnectWithoutMediaInputSchema';
import { UserUpsertWithoutMediaInputSchema } from './UserUpsertWithoutMediaInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutMediaInputSchema } from './UserUpdateToOneWithWhereWithoutMediaInputSchema';
import { UserUpdateWithoutMediaInputSchema } from './UserUpdateWithoutMediaInputSchema';
import { UserUncheckedUpdateWithoutMediaInputSchema } from './UserUncheckedUpdateWithoutMediaInputSchema';

export const UserUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutMediaNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutMediaInputSchema),z.lazy(() => UserUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutMediaInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutMediaInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutMediaInputSchema),z.lazy(() => UserUpdateWithoutMediaInputSchema),z.lazy(() => UserUncheckedUpdateWithoutMediaInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutMediaNestedInputSchema;
