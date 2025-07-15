import { z } from 'zod';
import { TestCaseScalarWhereInputObjectSchema } from './TestCaseScalarWhereInput.schema';
import { TestCaseUpdateManyMutationInputObjectSchema } from './TestCaseUpdateManyMutationInput.schema';
import { TestCaseUncheckedUpdateManyWithoutFlowInputObjectSchema } from './TestCaseUncheckedUpdateManyWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => TestCaseScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => TestCaseUpdateManyMutationInputObjectSchema),
      z.lazy(() => TestCaseUncheckedUpdateManyWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const TestCaseUpdateManyWithWhereWithoutFlowInputObjectSchema = Schema;
