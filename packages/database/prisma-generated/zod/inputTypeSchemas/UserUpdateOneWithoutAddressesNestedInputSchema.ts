import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutAddressesInputSchema } from './UserCreateWithoutAddressesInputSchema';
import { UserUncheckedCreateWithoutAddressesInputSchema } from './UserUncheckedCreateWithoutAddressesInputSchema';
import { UserCreateOrConnectWithoutAddressesInputSchema } from './UserCreateOrConnectWithoutAddressesInputSchema';
import { UserUpsertWithoutAddressesInputSchema } from './UserUpsertWithoutAddressesInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutAddressesInputSchema } from './UserUpdateToOneWithWhereWithoutAddressesInputSchema';
import { UserUpdateWithoutAddressesInputSchema } from './UserUpdateWithoutAddressesInputSchema';
import { UserUncheckedUpdateWithoutAddressesInputSchema } from './UserUncheckedUpdateWithoutAddressesInputSchema';

export const UserUpdateOneWithoutAddressesNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutAddressesNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutAddressesInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutAddressesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutAddressesInputSchema),z.lazy(() => UserUpdateWithoutAddressesInputSchema),z.lazy(() => UserUncheckedUpdateWithoutAddressesInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutAddressesNestedInputSchema;
