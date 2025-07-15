import { z } from 'zod';
import { FlowCreateWithoutTestCasesInputObjectSchema } from './FlowCreateWithoutTestCasesInput.schema';
import { FlowUncheckedCreateWithoutTestCasesInputObjectSchema } from './FlowUncheckedCreateWithoutTestCasesInput.schema';
import { FlowCreateOrConnectWithoutTestCasesInputObjectSchema } from './FlowCreateOrConnectWithoutTestCasesInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

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
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutTestCasesInputObjectSchema = Schema;
