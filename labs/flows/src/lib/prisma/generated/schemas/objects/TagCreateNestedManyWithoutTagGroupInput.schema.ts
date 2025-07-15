import { z } from 'zod';
import { TagCreateWithoutTagGroupInputObjectSchema } from './TagCreateWithoutTagGroupInput.schema';
import { TagUncheckedCreateWithoutTagGroupInputObjectSchema } from './TagUncheckedCreateWithoutTagGroupInput.schema';
import { TagCreateOrConnectWithoutTagGroupInputObjectSchema } from './TagCreateOrConnectWithoutTagGroupInput.schema';
import { TagCreateManyTagGroupInputEnvelopeObjectSchema } from './TagCreateManyTagGroupInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutTagGroupInputObjectSchema),
        z.lazy(() => TagCreateWithoutTagGroupInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutTagGroupInputObjectSchema),
        z
          .lazy(() => TagUncheckedCreateWithoutTagGroupInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutTagGroupInputObjectSchema),
        z
          .lazy(() => TagCreateOrConnectWithoutTagGroupInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyTagGroupInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TagCreateNestedManyWithoutTagGroupInputObjectSchema = Schema;
