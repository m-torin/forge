import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutSecretsInputObjectSchema } from './FlowCreateWithoutSecretsInput.schema';
import { FlowUncheckedCreateWithoutSecretsInputObjectSchema } from './FlowUncheckedCreateWithoutSecretsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutSecretsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutSecretsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutSecretsInputObjectSchema = Schema;
