import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutEdgesInputObjectSchema } from './FlowUpdateWithoutEdgesInput.schema';
import { FlowUncheckedUpdateWithoutEdgesInputObjectSchema } from './FlowUncheckedUpdateWithoutEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutEdgesInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutEdgesInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutEdgesInputObjectSchema = Schema;
