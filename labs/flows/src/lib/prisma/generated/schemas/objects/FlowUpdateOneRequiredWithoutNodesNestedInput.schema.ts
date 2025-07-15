import { z } from 'zod';
import { FlowCreateWithoutNodesInputObjectSchema } from './FlowCreateWithoutNodesInput.schema';
import { FlowUncheckedCreateWithoutNodesInputObjectSchema } from './FlowUncheckedCreateWithoutNodesInput.schema';
import { FlowCreateOrConnectWithoutNodesInputObjectSchema } from './FlowCreateOrConnectWithoutNodesInput.schema';
import { FlowUpsertWithoutNodesInputObjectSchema } from './FlowUpsertWithoutNodesInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutNodesInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutNodesInput.schema';
import { FlowUpdateWithoutNodesInputObjectSchema } from './FlowUpdateWithoutNodesInput.schema';
import { FlowUncheckedUpdateWithoutNodesInputObjectSchema } from './FlowUncheckedUpdateWithoutNodesInput.schema';

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
    upsert: z.lazy(() => FlowUpsertWithoutNodesInputObjectSchema).optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateToOneWithWhereWithoutNodesInputObjectSchema),
        z.lazy(() => FlowUpdateWithoutNodesInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutNodesInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneRequiredWithoutNodesNestedInputObjectSchema = Schema;
