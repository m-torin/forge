import { z } from 'zod';
import { FlowCreateWithoutSecretsInputObjectSchema } from './FlowCreateWithoutSecretsInput.schema';
import { FlowUncheckedCreateWithoutSecretsInputObjectSchema } from './FlowUncheckedCreateWithoutSecretsInput.schema';
import { FlowCreateOrConnectWithoutSecretsInputObjectSchema } from './FlowCreateOrConnectWithoutSecretsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutSecretsInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutSecretsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutSecretsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutSecretsInputObjectSchema = Schema;
