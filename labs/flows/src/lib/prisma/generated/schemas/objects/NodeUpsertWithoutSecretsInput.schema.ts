import { z } from 'zod';
import { NodeUpdateWithoutSecretsInputObjectSchema } from './NodeUpdateWithoutSecretsInput.schema';
import { NodeUncheckedUpdateWithoutSecretsInputObjectSchema } from './NodeUncheckedUpdateWithoutSecretsInput.schema';
import { NodeCreateWithoutSecretsInputObjectSchema } from './NodeCreateWithoutSecretsInput.schema';
import { NodeUncheckedCreateWithoutSecretsInputObjectSchema } from './NodeUncheckedCreateWithoutSecretsInput.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => NodeUpdateWithoutSecretsInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutSecretsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => NodeCreateWithoutSecretsInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutSecretsInputObjectSchema),
    ]),
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
  })
  .strict();

export const NodeUpsertWithoutSecretsInputObjectSchema = Schema;
