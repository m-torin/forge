import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutTestCasesInputObjectSchema } from './FlowUpdateWithoutTestCasesInput.schema';
import { FlowUncheckedUpdateWithoutTestCasesInputObjectSchema } from './FlowUncheckedUpdateWithoutTestCasesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutTestCasesInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutTestCasesInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutTestCasesInputObjectSchema = Schema;
