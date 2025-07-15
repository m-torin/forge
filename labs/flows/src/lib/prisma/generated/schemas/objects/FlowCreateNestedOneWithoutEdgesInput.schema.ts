import { z } from 'zod';
import { FlowCreateWithoutEdgesInputObjectSchema } from './FlowCreateWithoutEdgesInput.schema';
import { FlowUncheckedCreateWithoutEdgesInputObjectSchema } from './FlowUncheckedCreateWithoutEdgesInput.schema';
import { FlowCreateOrConnectWithoutEdgesInputObjectSchema } from './FlowCreateOrConnectWithoutEdgesInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutEdgesInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutEdgesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutEdgesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutEdgesInputObjectSchema = Schema;
