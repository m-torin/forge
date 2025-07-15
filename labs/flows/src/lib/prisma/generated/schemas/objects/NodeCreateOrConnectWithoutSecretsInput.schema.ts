import { z } from 'zod';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeCreateWithoutSecretsInputObjectSchema } from './NodeCreateWithoutSecretsInput.schema';
import { NodeUncheckedCreateWithoutSecretsInputObjectSchema } from './NodeUncheckedCreateWithoutSecretsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => NodeCreateWithoutSecretsInputObjectSchema),
      z.lazy(() => NodeUncheckedCreateWithoutSecretsInputObjectSchema),
    ]),
  })
  .strict();

export const NodeCreateOrConnectWithoutSecretsInputObjectSchema = Schema;
