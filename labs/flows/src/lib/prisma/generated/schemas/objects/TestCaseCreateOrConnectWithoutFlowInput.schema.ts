import { z } from 'zod';
import { TestCaseWhereUniqueInputObjectSchema } from './TestCaseWhereUniqueInput.schema';
import { TestCaseCreateWithoutFlowInputObjectSchema } from './TestCaseCreateWithoutFlowInput.schema';
import { TestCaseUncheckedCreateWithoutFlowInputObjectSchema } from './TestCaseUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => TestCaseCreateWithoutFlowInputObjectSchema),
      z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const TestCaseCreateOrConnectWithoutFlowInputObjectSchema = Schema;
