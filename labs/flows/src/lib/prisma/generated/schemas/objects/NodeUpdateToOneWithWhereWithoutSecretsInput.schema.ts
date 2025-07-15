import { z } from 'zod';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';
import { NodeUpdateWithoutSecretsInputObjectSchema } from './NodeUpdateWithoutSecretsInput.schema';
import { NodeUncheckedUpdateWithoutSecretsInputObjectSchema } from './NodeUncheckedUpdateWithoutSecretsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => NodeWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => NodeUpdateWithoutSecretsInputObjectSchema),
      z.lazy(() => NodeUncheckedUpdateWithoutSecretsInputObjectSchema),
    ]),
  })
  .strict();

export const NodeUpdateToOneWithWhereWithoutSecretsInputObjectSchema = Schema;
