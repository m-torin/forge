import { z } from 'zod';
import { FlowCreateWithoutNodesInputObjectSchema } from './FlowCreateWithoutNodesInput.schema';
import { FlowUncheckedCreateWithoutNodesInputObjectSchema } from './FlowUncheckedCreateWithoutNodesInput.schema';
import { FlowCreateOrConnectWithoutNodesInputObjectSchema } from './FlowCreateOrConnectWithoutNodesInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutNodesInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutNodesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutNodesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutNodesInputObjectSchema = Schema;
