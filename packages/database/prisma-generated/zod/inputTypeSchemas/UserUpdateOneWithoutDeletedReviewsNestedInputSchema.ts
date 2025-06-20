import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedReviewsInputSchema } from './UserCreateWithoutDeletedReviewsInputSchema';
import { UserUncheckedCreateWithoutDeletedReviewsInputSchema } from './UserUncheckedCreateWithoutDeletedReviewsInputSchema';
import { UserCreateOrConnectWithoutDeletedReviewsInputSchema } from './UserCreateOrConnectWithoutDeletedReviewsInputSchema';
import { UserUpsertWithoutDeletedReviewsInputSchema } from './UserUpsertWithoutDeletedReviewsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutDeletedReviewsInputSchema } from './UserUpdateToOneWithWhereWithoutDeletedReviewsInputSchema';
import { UserUpdateWithoutDeletedReviewsInputSchema } from './UserUpdateWithoutDeletedReviewsInputSchema';
import { UserUncheckedUpdateWithoutDeletedReviewsInputSchema } from './UserUncheckedUpdateWithoutDeletedReviewsInputSchema';

export const UserUpdateOneWithoutDeletedReviewsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutDeletedReviewsNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedReviewsInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedReviewsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutDeletedReviewsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutDeletedReviewsInputSchema),z.lazy(() => UserUpdateWithoutDeletedReviewsInputSchema),z.lazy(() => UserUncheckedUpdateWithoutDeletedReviewsInputSchema) ]).optional(),
}).strict();

export default UserUpdateOneWithoutDeletedReviewsNestedInputSchema;
