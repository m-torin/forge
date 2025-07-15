import { z } from 'zod';
import { SecretCreateWithoutFlowInputObjectSchema } from './SecretCreateWithoutFlowInput.schema';
import { SecretUncheckedCreateWithoutFlowInputObjectSchema } from './SecretUncheckedCreateWithoutFlowInput.schema';
import { SecretCreateOrConnectWithoutFlowInputObjectSchema } from './SecretCreateOrConnectWithoutFlowInput.schema';
import { SecretCreateManyFlowInputEnvelopeObjectSchema } from './SecretCreateManyFlowInputEnvelope.schema';
import { SecretWhereUniqueInputObjectSchema } from './SecretWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => SecretCreateWithoutFlowInputObjectSchema),
        z.lazy(() => SecretCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => SecretUncheckedCreateWithoutFlowInputObjectSchema),
        z.lazy(() => SecretUncheckedCreateWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => SecretCreateOrConnectWithoutFlowInputObjectSchema),
        z.lazy(() => SecretCreateOrConnectWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => SecretCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => SecretWhereUniqueInputObjectSchema),
        z.lazy(() => SecretWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const SecretUncheckedCreateNestedManyWithoutFlowInputObjectSchema =
  Schema;
