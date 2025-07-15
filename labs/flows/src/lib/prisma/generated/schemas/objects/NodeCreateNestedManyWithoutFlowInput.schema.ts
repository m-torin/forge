import { z } from 'zod';
import { NodeCreateWithoutFlowInputObjectSchema } from './NodeCreateWithoutFlowInput.schema';
import { NodeUncheckedCreateWithoutFlowInputObjectSchema } from './NodeUncheckedCreateWithoutFlowInput.schema';
import { NodeCreateOrConnectWithoutFlowInputObjectSchema } from './NodeCreateOrConnectWithoutFlowInput.schema';
import { NodeCreateManyFlowInputEnvelopeObjectSchema } from './NodeCreateManyFlowInputEnvelope.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutFlowInputObjectSchema),
        z.lazy(() => NodeCreateWithoutFlowInputObjectSchema).array(),
        z.lazy(() => NodeUncheckedCreateWithoutFlowInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => NodeCreateOrConnectWithoutFlowInputObjectSchema),
        z.lazy(() => NodeCreateOrConnectWithoutFlowInputObjectSchema).array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => NodeCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => NodeWhereUniqueInputObjectSchema),
        z.lazy(() => NodeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const NodeCreateNestedManyWithoutFlowInputObjectSchema = Schema;
