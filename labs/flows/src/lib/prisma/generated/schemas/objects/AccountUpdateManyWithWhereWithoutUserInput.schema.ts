import { z } from 'zod';
import { AccountScalarWhereInputObjectSchema } from './AccountScalarWhereInput.schema';
import { AccountUpdateManyMutationInputObjectSchema } from './AccountUpdateManyMutationInput.schema';
import { AccountUncheckedUpdateManyWithoutUserInputObjectSchema } from './AccountUncheckedUpdateManyWithoutUserInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => AccountScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => AccountUpdateManyMutationInputObjectSchema),
      z.lazy(() => AccountUncheckedUpdateManyWithoutUserInputObjectSchema),
    ]),
  })
  .strict();

export const AccountUpdateManyWithWhereWithoutUserInputObjectSchema = Schema;
