import { z } from 'zod';
import { FlowCreateWithoutTestCasesInputObjectSchema } from './FlowCreateWithoutTestCasesInput.schema';
import { FlowUncheckedCreateWithoutTestCasesInputObjectSchema } from './FlowUncheckedCreateWithoutTestCasesInput.schema';
import { FlowCreateOrConnectWithoutTestCasesInputObjectSchema } from './FlowCreateOrConnectWithoutTestCasesInput.schema';
import { FlowUpsertWithoutTestCasesInputObjectSchema } from './FlowUpsertWithoutTestCasesInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutTestCasesInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutTestCasesInput.schema';
import { FlowUpdateWithoutTestCasesInputObjectSchema } from './FlowUpdateWithoutTestCasesInput.schema';
import { FlowUncheckedUpdateWithoutTestCasesInputObjectSchema } from './FlowUncheckedUpdateWithoutTestCasesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutTestCasesInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutTestCasesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutTestCasesInputObjectSchema)
      .optional(),
    upsert: z
      .lazy(() => FlowUpsertWithoutTestCasesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateToOneWithWhereWithoutTestCasesInputObjectSchema),
        z.lazy(() => FlowUpdateWithoutTestCasesInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutTestCasesInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneRequiredWithoutTestCasesNestedInputObjectSchema =
  Schema;
