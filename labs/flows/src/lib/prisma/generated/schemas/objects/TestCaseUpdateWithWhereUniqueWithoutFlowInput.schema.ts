import { z } from 'zod';
import { TestCaseWhereUniqueInputObjectSchema } from './TestCaseWhereUniqueInput.schema';
import { TestCaseUpdateWithoutFlowInputObjectSchema } from './TestCaseUpdateWithoutFlowInput.schema';
import { TestCaseUncheckedUpdateWithoutFlowInputObjectSchema } from './TestCaseUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => TestCaseUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => TestCaseUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const TestCaseUpdateWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
