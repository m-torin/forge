import { z } from 'zod';
import { TagGroupCreateWithoutInstanceInputObjectSchema } from './TagGroupCreateWithoutInstanceInput.schema';
import { TagGroupUncheckedCreateWithoutInstanceInputObjectSchema } from './TagGroupUncheckedCreateWithoutInstanceInput.schema';
import { TagGroupCreateOrConnectWithoutInstanceInputObjectSchema } from './TagGroupCreateOrConnectWithoutInstanceInput.schema';
import { TagGroupCreateManyInstanceInputEnvelopeObjectSchema } from './TagGroupCreateManyInstanceInputEnvelope.schema';
import { TagGroupWhereUniqueInputObjectSchema } from './TagGroupWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagGroupCreateWithoutInstanceInputObjectSchema),
        z.lazy(() => TagGroupCreateWithoutInstanceInputObjectSchema).array(),
        z.lazy(() => TagGroupUncheckedCreateWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagGroupUncheckedCreateWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagGroupCreateOrConnectWithoutInstanceInputObjectSchema),
        z
          .lazy(() => TagGroupCreateOrConnectWithoutInstanceInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagGroupCreateManyInstanceInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema),
        z.lazy(() => TagGroupWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TagGroupCreateNestedManyWithoutInstanceInputObjectSchema = Schema;
