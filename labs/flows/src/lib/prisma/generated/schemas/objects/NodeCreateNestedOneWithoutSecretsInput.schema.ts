import { z } from 'zod';
import { NodeCreateWithoutSecretsInputObjectSchema } from './NodeCreateWithoutSecretsInput.schema';
import { NodeUncheckedCreateWithoutSecretsInputObjectSchema } from './NodeUncheckedCreateWithoutSecretsInput.schema';
import { NodeCreateOrConnectWithoutSecretsInputObjectSchema } from './NodeCreateOrConnectWithoutSecretsInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutSecretsInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutSecretsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => NodeCreateOrConnectWithoutSecretsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const NodeCreateNestedOneWithoutSecretsInputObjectSchema = Schema;
