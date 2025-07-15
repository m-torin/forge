import { z } from 'zod';
import { FlowUpdateWithoutTestCasesInputObjectSchema } from './FlowUpdateWithoutTestCasesInput.schema';
import { FlowUncheckedUpdateWithoutTestCasesInputObjectSchema } from './FlowUncheckedUpdateWithoutTestCasesInput.schema';
import { FlowCreateWithoutTestCasesInputObjectSchema } from './FlowCreateWithoutTestCasesInput.schema';
import { FlowUncheckedCreateWithoutTestCasesInputObjectSchema } from './FlowUncheckedCreateWithoutTestCasesInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutTestCasesInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutTestCasesInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutTestCasesInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutTestCasesInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutTestCasesInputObjectSchema = Schema;
