import { z } from 'zod';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';
import { SecretUpdateWithoutNodeInputObjectSchema } from './SecretUpdateWithoutNodeInput.schema';
import { SecretUncheckedUpdateWithoutNodeInputObjectSchema } from './SecretUncheckedUpdateWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => SecretWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => SecretUpdateWithoutNodeInputObjectSchema),
      z.lazy(() => SecretUncheckedUpdateWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const SecretUpdateWithWhereUniqueWithoutNodeInputObjectSchema = Schema;
