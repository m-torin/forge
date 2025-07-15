import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutInstanceInputObjectSchema } from './FlowCreateWithoutInstanceInput.schema';
import { FlowUncheckedCreateWithoutInstanceInputObjectSchema } from './FlowUncheckedCreateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutInstanceInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutInstanceInputObjectSchema = Schema;
