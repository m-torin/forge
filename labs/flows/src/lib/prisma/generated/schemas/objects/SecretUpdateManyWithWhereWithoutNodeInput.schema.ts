import { z } from 'zod';
import { SecretScalarWhereInputObjectSchema } from './SecretScalarWhereInput.schema';
import { SecretUpdateManyMutationInputObjectSchema } from './SecretUpdateManyMutationInput.schema';
import { SecretUncheckedUpdateManyWithoutNodeInputObjectSchema } from './SecretUncheckedUpdateManyWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => SecretScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => SecretUpdateManyMutationInputObjectSchema),
      z.lazy(() => SecretUncheckedUpdateManyWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const SecretUpdateManyWithWhereWithoutNodeInputObjectSchema = Schema;
