import { z } from 'zod';
import { NodeCreateWithoutInfrastructureInputObjectSchema } from './NodeCreateWithoutInfrastructureInput.schema';
import { NodeUncheckedCreateWithoutInfrastructureInputObjectSchema } from './NodeUncheckedCreateWithoutInfrastructureInput.schema';
import { NodeCreateOrConnectWithoutInfrastructureInputObjectSchema } from './NodeCreateOrConnectWithoutInfrastructureInput.schema';
import { NodeUpsertWithWhereUniqueWithoutInfrastructureInputObjectSchema } from './NodeUpsertWithWhereUniqueWithoutInfrastructureInput.schema';
import { NodeCreateManyInfrastructureInputEnvelopeObjectSchema } from './NodeCreateManyInfrastructureInputEnvelope.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateWithWhereUniqueWithoutInfrastructureInputObjectSchema } from './NodeUpdateWithWhereUniqueWithoutInfrastructureInput.schema';
import { NodeUpdateManyWithWhereWithoutInfrastructureInputObjectSchema } from './NodeUpdateManyWithWhereWithoutInfrastructureInput.schema';
import { NodeScalarWhereInputObjectSchema } from './NodeScalarWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutInfrastructureInputObjectSchema),
        z.lazy(() => NodeCreateWithoutInfrastructureInputObjectSchema).array(),
        z.lazy(() => NodeUncheckedCreateWithoutInfrastructureInputObjectSchema),
        z
          .lazy(() => NodeUncheckedCreateWithoutInfrastructureInputObjectSchema)
          .array(),
      ])
      .optional(),
    connectOrCreate: z
      .union([
        z.lazy(() => NodeCreateOrConnectWithoutInfrastructureInputObjectSchema),
        z
          .lazy(() => NodeCreateOrConnectWithoutInfrastructureInputObjectSchema)
          .array(),
      ])
      .optional(),
    upsert: z
      .union([
        z.lazy(
          () => NodeUpsertWithWhereUniqueWithoutInfrastructureInputObjectSchema,
        ),
        z
          .lazy(
            () =>
              NodeUpsertWithWhereUniqueWithoutInfrastructureInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    createMany: z
      .lazy(() => NodeCreateManyInfrastructureInputEnvelopeObjectSchema)
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
        z.lazy(
          () => NodeUpdateWithWhereUniqueWithoutInfrastructureInputObjectSchema,
        ),
        z
          .lazy(
            () =>
              NodeUpdateWithWhereUniqueWithoutInfrastructureInputObjectSchema,
          )
          .array(),
      ])
      .optional(),
    updateMany: z
      .union([
        z.lazy(
          () => NodeUpdateManyWithWhereWithoutInfrastructureInputObjectSchema,
        ),
        z
          .lazy(
            () => NodeUpdateManyWithWhereWithoutInfrastructureInputObjectSchema,
          )
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

export const NodeUpdateManyWithoutInfrastructureNestedInputObjectSchema =
  Schema;
