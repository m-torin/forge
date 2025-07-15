import { z } from 'zod';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';
import { SecretUpdateWithoutNodeInputObjectSchema } from './SecretUpdateWithoutNodeInput.schema';
import { SecretUncheckedUpdateWithoutNodeInputObjectSchema } from './SecretUncheckedUpdateWithoutNodeInput.schema';
import { SecretCreateWithoutNodeInputObjectSchema } from './SecretCreateWithoutNodeInput.schema';
import { SecretUncheckedCreateWithoutNodeInputObjectSchema } from './SecretUncheckedCreateWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => SecretWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => SecretUpdateWithoutNodeInputObjectSchema),
      z.lazy(() => SecretUncheckedUpdateWithoutNodeInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => SecretCreateWithoutNodeInputObjectSchema),
      z.lazy(() => SecretUncheckedCreateWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const SecretUpsertWithWhereUniqueWithoutNodeInputObjectSchema = Schema;
