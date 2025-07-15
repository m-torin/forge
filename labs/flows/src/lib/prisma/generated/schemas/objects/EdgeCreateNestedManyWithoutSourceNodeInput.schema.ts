import { z } from 'zod';
import { EdgeCreateWithoutSourceNodeInputObjectSchema } from './EdgeCreateWithoutSourceNodeInput.schema';
import { EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutSourceNodeInput.schema';
import { EdgeCreateOrConnectWithoutSourceNodeInputObjectSchema } from './EdgeCreateOrConnectWithoutSourceNodeInput.schema';
import { EdgeCreateManySourceNodeInputEnvelopeObjectSchema } from './EdgeCreateManySourceNodeInputEnvelope.schema';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => EdgeCreateWithoutSourceNodeInputObjectSchema),
        z.lazy(() => EdgeCreateWithoutSourceNodeInputObjectSchema).array(),
        z.lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema),
        z
          .lazy(() => EdgeUncheckedCreateWithoutSourceNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputObjectSchema),
        z
          .lazy(() => EdgeCreateOrConnectWithoutSourceNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => EdgeCreateManySourceNodeInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => EdgeWhereUniqueInputObjectSchema),
        z.lazy(() => EdgeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const EdgeCreateNestedManyWithoutSourceNodeInputObjectSchema = Schema;
