import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutNodesInputObjectSchema } from './FlowUpdateWithoutNodesInput.schema';
import { FlowUncheckedUpdateWithoutNodesInputObjectSchema } from './FlowUncheckedUpdateWithoutNodesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutNodesInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutNodesInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutNodesInputObjectSchema = Schema;
