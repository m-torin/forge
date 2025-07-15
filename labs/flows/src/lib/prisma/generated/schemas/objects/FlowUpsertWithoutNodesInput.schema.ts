import { z } from 'zod';
import { FlowUpdateWithoutNodesInputObjectSchema } from './FlowUpdateWithoutNodesInput.schema';
import { FlowUncheckedUpdateWithoutNodesInputObjectSchema } from './FlowUncheckedUpdateWithoutNodesInput.schema';
import { FlowCreateWithoutNodesInputObjectSchema } from './FlowCreateWithoutNodesInput.schema';
import { FlowUncheckedCreateWithoutNodesInputObjectSchema } from './FlowUncheckedCreateWithoutNodesInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutNodesInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutNodesInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutNodesInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutNodesInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutNodesInputObjectSchema = Schema;
