import { z } from 'zod';
import { FlowEventScalarWhereInputObjectSchema } from './FlowEventScalarWhereInput.schema';
import { FlowEventUpdateManyMutationInputObjectSchema } from './FlowEventUpdateManyMutationInput.schema';
import { FlowEventUncheckedUpdateManyWithoutFlowInputObjectSchema } from './FlowEventUncheckedUpdateManyWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowEventScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowEventUpdateManyMutationInputObjectSchema),
      z.lazy(() => FlowEventUncheckedUpdateManyWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowEventUpdateManyWithWhereWithoutFlowInputObjectSchema = Schema;
