import { z } from 'zod';
import { SecretCreateWithoutNodeInputObjectSchema } from './SecretCreateWithoutNodeInput.schema';
import { SecretUncheckedCreateWithoutNodeInputObjectSchema } from './SecretUncheckedCreateWithoutNodeInput.schema';
import { SecretCreateOrConnectWithoutNodeInputObjectSchema } from './SecretCreateOrConnectWithoutNodeInput.schema';
import { SecretCreateManyNodeInputEnvelopeObjectSchema } from './SecretCreateManyNodeInputEnvelope.schema';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => SecretCreateWithoutNodeInputObjectSchema),
        z.lazy(() => SecretCreateWithoutNodeInputObjectSchema).array(),
        z.lazy(() => SecretUncheckedCreateWithoutNodeInputObjectSchema),
        z.lazy(() => SecretUncheckedCreateWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => SecretCreateOrConnectWithoutNodeInputObjectSchema),
        z.lazy(() => SecretCreateOrConnectWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => SecretCreateManyNodeInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => SecretWhereUniqueInputObjectSchema),
        z.lazy(() => SecretWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const SecretCreateNestedManyWithoutNodeInputObjectSchema = Schema;
