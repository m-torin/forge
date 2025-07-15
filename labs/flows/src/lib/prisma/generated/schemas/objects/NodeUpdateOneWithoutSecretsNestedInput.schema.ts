import { z } from 'zod';
import { NodeCreateWithoutSecretsInputObjectSchema } from './NodeCreateWithoutSecretsInput.schema';
import { NodeUncheckedCreateWithoutSecretsInputObjectSchema } from './NodeUncheckedCreateWithoutSecretsInput.schema';
import { NodeCreateOrConnectWithoutSecretsInputObjectSchema } from './NodeCreateOrConnectWithoutSecretsInput.schema';
import { NodeUpsertWithoutSecretsInputObjectSchema } from './NodeUpsertWithoutSecretsInput.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateToOneWithWhereWithoutSecretsInputObjectSchema } from './NodeUpdateToOneWithWhereWithoutSecretsInput.schema';
import { NodeUpdateWithoutSecretsInputObjectSchema } from './NodeUpdateWithoutSecretsInput.schema';
import { NodeUncheckedUpdateWithoutSecretsInputObjectSchema } from './NodeUncheckedUpdateWithoutSecretsInput.schema';

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
    upsert: z.lazy(() => NodeUpsertWithoutSecretsInputObjectSchema).optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => NodeWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => NodeWhereInputObjectSchema)])
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => NodeUpdateToOneWithWhereWithoutSecretsInputObjectSchema),
        z.lazy(() => NodeUpdateWithoutSecretsInputObjectSchema),
        z.lazy(() => NodeUncheckedUpdateWithoutSecretsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NodeUpdateOneWithoutSecretsNestedInputObjectSchema = Schema;
