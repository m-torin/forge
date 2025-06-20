import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateWithoutDeletedTaxonomiesInputSchema } from './UserCreateWithoutDeletedTaxonomiesInputSchema';
import { UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema } from './UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema';
import { UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema } from './UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutDeletedTaxonomiesInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutDeletedTaxonomiesInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutDeletedTaxonomiesInputSchema),z.lazy(() => UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export default UserCreateNestedOneWithoutDeletedTaxonomiesInputSchema;
