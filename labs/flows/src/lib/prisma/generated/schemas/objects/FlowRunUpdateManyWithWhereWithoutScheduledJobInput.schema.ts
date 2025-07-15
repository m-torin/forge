import { z } from 'zod';
import { FlowRunScalarWhereInputObjectSchema } from './FlowRunScalarWhereInput.schema';
import { FlowRunUpdateManyMutationInputObjectSchema } from './FlowRunUpdateManyMutationInput.schema';
import { FlowRunUncheckedUpdateManyWithoutScheduledJobInputObjectSchema } from './FlowRunUncheckedUpdateManyWithoutScheduledJobInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunScalarWhereInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowRunUpdateManyMutationInputObjectSchema),
      z.lazy(
        () => FlowRunUncheckedUpdateManyWithoutScheduledJobInputObjectSchema,
      ),
    ]),
  })
  .strict();

export const FlowRunUpdateManyWithWhereWithoutScheduledJobInputObjectSchema =
  Schema;
