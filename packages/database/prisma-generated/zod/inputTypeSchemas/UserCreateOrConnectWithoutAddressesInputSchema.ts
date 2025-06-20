import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutAddressesInputSchema } from './UserCreateWithoutAddressesInputSchema';
import { UserUncheckedCreateWithoutAddressesInputSchema } from './UserUncheckedCreateWithoutAddressesInputSchema';

export const UserCreateOrConnectWithoutAddressesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutAddressesInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutAddressesInputSchema),z.lazy(() => UserUncheckedCreateWithoutAddressesInputSchema) ]),
}).strict();

export default UserCreateOrConnectWithoutAddressesInputSchema;
