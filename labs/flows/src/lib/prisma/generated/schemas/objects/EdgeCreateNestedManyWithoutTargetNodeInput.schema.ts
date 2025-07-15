import { z } from 'zod';
import { EdgeCreateWithoutTargetNodeInputObjectSchema } from './EdgeCreateWithoutTargetNodeInput.schema';
import { EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema } from './EdgeUncheckedCreateWithoutTargetNodeInput.schema';
import { EdgeCreateOrConnectWithoutTargetNodeInputObjectSchema } from './EdgeCreateOrConnectWithoutTargetNodeInput.schema';
import { EdgeCreateManyTargetNodeInputEnvelopeObjectSchema } from './EdgeCreateManyTargetNodeInputEnvelope.schema';
import { EdgeWhereUniqueInputObjectSchema } from './EdgeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => EdgeCreateWithoutTargetNodeInputObjectSchema),
        z.lazy(() => EdgeCreateWithoutTargetNodeInputObjectSchema).array(),
        z.lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema),
        z
          .lazy(() => EdgeUncheckedCreateWithoutTargetNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputObjectSchema),
        z
          .lazy(() => EdgeCreateOrConnectWithoutTargetNodeInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => EdgeCreateManyTargetNodeInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => EdgeWhereUniqueInputObjectSchema),
        z.lazy(() => EdgeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const EdgeCreateNestedManyWithoutTargetNodeInputObjectSchema = Schema;
