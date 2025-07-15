import { z } from 'zod';
import { FlowScalarWhereInputObjectSchema } from './FlowScalarWhereInput.schema';
import { FlowUpdateManyMutationInputObjectSchema } from './FlowUpdateManyMutationInput.schema';
import { FlowUncheckedUpdateManyWithoutInstanceInputObjectSchema } from './FlowUncheckedUpdateManyWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowUpdateManyMutationInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateManyWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateManyWithWhereWithoutInstanceInputObjectSchema = Schema;
