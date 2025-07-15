import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutNodesInputObjectSchema } from './FlowCreateWithoutNodesInput.schema';
import { FlowUncheckedCreateWithoutNodesInputObjectSchema } from './FlowUncheckedCreateWithoutNodesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutNodesInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutNodesInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutNodesInputObjectSchema = Schema;
