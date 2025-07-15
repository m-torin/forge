import { z } from 'zod';
import { TagCreateWithoutNodeInputObjectSchema } from './TagCreateWithoutNodeInput.schema';
import { TagUncheckedCreateWithoutNodeInputObjectSchema } from './TagUncheckedCreateWithoutNodeInput.schema';
import { TagCreateOrConnectWithoutNodeInputObjectSchema } from './TagCreateOrConnectWithoutNodeInput.schema';
import { TagCreateManyNodeInputEnvelopeObjectSchema } from './TagCreateManyNodeInputEnvelope.schema';
import { TagWhereUniqueInputObjectSchema } from './TagWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => TagCreateWithoutNodeInputObjectSchema),
        z.lazy(() => TagCreateWithoutNodeInputObjectSchema).array(),
        z.lazy(() => TagUncheckedCreateWithoutNodeInputObjectSchema),
        z.lazy(() => TagUncheckedCreateWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => TagCreateOrConnectWithoutNodeInputObjectSchema),
        z.lazy(() => TagCreateOrConnectWithoutNodeInputObjectSchema).array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => TagCreateManyNodeInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => TagWhereUniqueInputObjectSchema),
        z.lazy(() => TagWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const TagCreateNestedManyWithoutNodeInputObjectSchema = Schema;
