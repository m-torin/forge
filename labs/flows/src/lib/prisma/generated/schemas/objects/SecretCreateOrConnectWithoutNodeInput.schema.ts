import { z } from 'zod';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';
import { SecretCreateWithoutNodeInputObjectSchema } from './SecretCreateWithoutNodeInput.schema';
import { SecretUncheckedCreateWithoutNodeInputObjectSchema } from './SecretUncheckedCreateWithoutNodeInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => SecretWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => SecretCreateWithoutNodeInputObjectSchema),
      z.lazy(() => SecretUncheckedCreateWithoutNodeInputObjectSchema),
    ]),
  })
  .strict();

export const SecretCreateOrConnectWithoutNodeInputObjectSchema = Schema;
