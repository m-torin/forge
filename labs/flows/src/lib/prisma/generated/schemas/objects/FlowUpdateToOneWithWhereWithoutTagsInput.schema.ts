import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutTagsInputObjectSchema } from './FlowUpdateWithoutTagsInput.schema';
import { FlowUncheckedUpdateWithoutTagsInputObjectSchema } from './FlowUncheckedUpdateWithoutTagsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutTagsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutTagsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutTagsInputObjectSchema = Schema;
