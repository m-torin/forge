import { z } from 'zod';
import { TagCreateWithoutInstanceInputObjectSchema } from './TagCreateWithoutInstanceInput.schema';
import { TagUncheckedCreateWithoutInstanceInputObjectSchema } from './TagUncheckedCreateWithoutInstanceInput.schema';
import { TagCreateOrConnectWithoutInstanceInputObjectSchema } from './TagCreateOrConnectWithoutInstanceInput.schema';
import { TagCreateManyInstanceInputEnvelopeObjectSchema } from './TagCreateManyInstanceInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutInstanceInputObjectSchema),
        z.lazy(() => TagCreateWithoutInstanceInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagUncheckedCreateWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagCreateOrConnectWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyInstanceInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TagUncheckedCreateNestedManyWithoutInstanceInputObjectSchema =
  Schema;
