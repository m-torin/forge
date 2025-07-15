import { z } from 'zod';
import { NodeCreateWithoutFlowInputObjectSchema } from './NodeCreateWithoutFlowInput.schema';
import { NodeUncheckedCreateWithoutFlowInputObjectSchema } from './NodeUncheckedCreateWithoutFlowInput.schema';
import { NodeCreateOrConnectWithoutFlowInputObjectSchema } from './NodeCreateOrConnectWithoutFlowInput.schema';
import { NodeUpsertWithWhereUniqueWithoutFlowInputObjectSchema } from './NodeUpsertWithWhereUniqueWithoutFlowInput.schema';
import { NodeCreateManyFlowInputEnvelopeObjectSchema } from './NodeCreateManyFlowInputEnvelope.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateWithWhereUniqueWithoutFlowInputObjectSchema } from './NodeUpdateWithWhereUniqueWithoutFlowInput.schema';
import { NodeUpdateManyWithWhereWithoutFlowInputObjectSchema } from './NodeUpdateManyWithWhereWithoutFlowInput.schema';
import { NodeScalarWhereInputObjectSchema } from './NodeScalarWhereInput.schema';

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
    upsert: z
      .union([
        z.lazy(() => NodeUpsertWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => NodeUpsertWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => NodeCreateManyFlowInputEnvelopeObjectSchema)
      .optional(),
    set: z
      .union([
        z.lazy(() => NodeWhereUniqueInputObjectSchema),
        z.lazy(() => NodeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    disconnect: z
      .union([
        z.lazy(() => NodeWhereUniqueInputObjectSchema),
        z.lazy(() => NodeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    delete: z
      .union([
        z.lazy(() => NodeWhereUniqueInputObjectSchema),
        z.lazy(() => NodeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    connect: z
      .union([
        z.lazy(() => NodeWhereUniqueInputObjectSchema),
        z.lazy(() => NodeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
    update: z
      .union([
        z.lazy(() => NodeUpdateWithWhereUniqueWithoutFlowInputObjectSchema),
        z
          .lazy(() => NodeUpdateWithWhereUniqueWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(() => NodeUpdateManyWithWhereWithoutFlowInputObjectSchema),
        z
          .lazy(() => NodeUpdateManyWithWhereWithoutFlowInputObjectSchema)
          .array(),
      ])
      .optional(),
    deleteMany: z
      .union([
        z.lazy(() => NodeScalarWhereInputObjectSchema),
        z.lazy(() => NodeScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const NodeUncheckedUpdateManyWithoutFlowNestedInputObjectSchema = Schema;
