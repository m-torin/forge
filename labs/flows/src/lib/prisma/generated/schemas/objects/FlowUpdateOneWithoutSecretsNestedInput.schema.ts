import { z } from 'zod';
import { FlowCreateWithoutSecretsInputObjectSchema } from './FlowCreateWithoutSecretsInput.schema';
import { FlowUncheckedCreateWithoutSecretsInputObjectSchema } from './FlowUncheckedCreateWithoutSecretsInput.schema';
import { FlowCreateOrConnectWithoutSecretsInputObjectSchema } from './FlowCreateOrConnectWithoutSecretsInput.schema';
import { FlowUpsertWithoutSecretsInputObjectSchema } from './FlowUpsertWithoutSecretsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutSecretsInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutSecretsInput.schema';
import { FlowUpdateWithoutSecretsInputObjectSchema } from './FlowUpdateWithoutSecretsInput.schema';
import { FlowUncheckedUpdateWithoutSecretsInputObjectSchema } from './FlowUncheckedUpdateWithoutSecretsInput.schema';

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
    upsert: z.lazy(() => FlowUpsertWithoutSecretsInputObjectSchema).optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => FlowWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => FlowWhereInputObjectSchema)])
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateToOneWithWhereWithoutSecretsInputObjectSchema),
        z.lazy(() => FlowUpdateWithoutSecretsInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutSecretsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneWithoutSecretsNestedInputObjectSchema = Schema;
