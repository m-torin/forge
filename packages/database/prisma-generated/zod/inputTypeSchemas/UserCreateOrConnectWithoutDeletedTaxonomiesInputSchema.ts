import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserCreateWithoutDeletedTaxonomiesInputSchema } from './UserCreateWithoutDeletedTaxonomiesInputSchema';
import { UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema } from './UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema';

export const UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutDeletedTaxonomiesInput> =
  z
    .object({
      where: z.lazy(() => UserWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => UserCreateWithoutDeletedTaxonomiesInputSchema),
        z.lazy(() => UserUncheckedCreateWithoutDeletedTaxonomiesInputSchema),
      ]),
    })
    .strict();

export default UserCreateOrConnectWithoutDeletedTaxonomiesInputSchema;
