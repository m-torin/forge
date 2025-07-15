import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutTestCasesInputObjectSchema } from './FlowCreateWithoutTestCasesInput.schema';
import { FlowUncheckedCreateWithoutTestCasesInputObjectSchema } from './FlowUncheckedCreateWithoutTestCasesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutTestCasesInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutTestCasesInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutTestCasesInputObjectSchema = Schema;
