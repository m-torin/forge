import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutEdgesInputObjectSchema } from './FlowCreateWithoutEdgesInput.schema';
import { FlowUncheckedCreateWithoutEdgesInputObjectSchema } from './FlowUncheckedCreateWithoutEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutEdgesInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutEdgesInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutEdgesInputObjectSchema = Schema;
