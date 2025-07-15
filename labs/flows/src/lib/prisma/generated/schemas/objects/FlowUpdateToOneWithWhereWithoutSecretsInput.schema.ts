import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutSecretsInputObjectSchema } from './FlowUpdateWithoutSecretsInput.schema';
import { FlowUncheckedUpdateWithoutSecretsInputObjectSchema } from './FlowUncheckedUpdateWithoutSecretsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutSecretsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutSecretsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutSecretsInputObjectSchema = Schema;
