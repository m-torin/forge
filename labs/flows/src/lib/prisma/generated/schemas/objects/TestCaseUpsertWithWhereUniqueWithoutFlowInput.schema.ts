import { z } from 'zod';
import { TestCaseWhereUniqueInputObjectSchema } from './TestCaseWhereUniqueInput.schema';
import { TestCaseUpdateWithoutFlowInputObjectSchema } from './TestCaseUpdateWithoutFlowInput.schema';
import { TestCaseUncheckedUpdateWithoutFlowInputObjectSchema } from './TestCaseUncheckedUpdateWithoutFlowInput.schema';
import { TestCaseCreateWithoutFlowInputObjectSchema } from './TestCaseCreateWithoutFlowInput.schema';
import { TestCaseUncheckedCreateWithoutFlowInputObjectSchema } from './TestCaseUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TestCaseWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => TestCaseUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => TestCaseUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => TestCaseCreateWithoutFlowInputObjectSchema),
      z.lazy(() => TestCaseUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const TestCaseUpsertWithWhereUniqueWithoutFlowInputObjectSchema = Schema;
