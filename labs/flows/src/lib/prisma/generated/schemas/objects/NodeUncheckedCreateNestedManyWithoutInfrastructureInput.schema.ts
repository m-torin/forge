import { z } from 'zod';
import { NodeCreateWithoutInfrastructureInputObjectSchema } from './NodeCreateWithoutInfrastructureInput.schema';
import { NodeUncheckedCreateWithoutInfrastructureInputObjectSchema } from './NodeUncheckedCreateWithoutInfrastructureInput.schema';
import { NodeCreateOrConnectWithoutInfrastructureInputObjectSchema } from './NodeCreateOrConnectWithoutInfrastructureInput.schema';
import { NodeCreateManyInfrastructureInputEnvelopeObjectSchema } from './NodeCreateManyInfrastructureInputEnvelope.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';

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
    createMany: z
      .lazy(() => NodeCreateManyInfrastructureInputEnvelopeObjectSchema)
      .optional(),
    connect: z
      .union([
        z.lazy(() => NodeWhereUniqueInputObjectSchema),
        z.lazy(() => NodeWhereUniqueInputObjectSchema).array(),
      ])
      .optional(),
  })
  .strict();

export const NodeUncheckedCreateNestedManyWithoutInfrastructureInputObjectSchema =
  Schema;
