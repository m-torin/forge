import { z } from 'zod';
import { FlowUpdateWithoutSecretsInputObjectSchema } from './FlowUpdateWithoutSecretsInput.schema';
import { FlowUncheckedUpdateWithoutSecretsInputObjectSchema } from './FlowUncheckedUpdateWithoutSecretsInput.schema';
import { FlowCreateWithoutSecretsInputObjectSchema } from './FlowCreateWithoutSecretsInput.schema';
import { FlowUncheckedCreateWithoutSecretsInputObjectSchema } from './FlowUncheckedCreateWithoutSecretsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutSecretsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutSecretsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutSecretsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutSecretsInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutSecretsInputObjectSchema = Schema;
