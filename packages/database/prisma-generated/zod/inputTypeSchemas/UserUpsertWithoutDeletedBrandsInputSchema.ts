import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserUpdateWithoutDeletedBrandsInputSchema } from './UserUpdateWithoutDeletedBrandsInputSchema';
import { UserUncheckedUpdateWithoutDeletedBrandsInputSchema } from './UserUncheckedUpdateWithoutDeletedBrandsInputSchema';
import { UserCreateWithoutDeletedBrandsInputSchema } from './UserCreateWithoutDeletedBrandsInputSchema';
import { UserUncheckedCreateWithoutDeletedBrandsInputSchema } from './UserUncheckedCreateWithoutDeletedBrandsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutDeletedBrandsInputSchema: z.ZodType<Prisma.UserUpsertWithoutDeletedBrandsInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutDeletedBrandsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedBrandsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedBrandsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedBrandsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export default UserUpsertWithoutDeletedBrandsInputSchema;
