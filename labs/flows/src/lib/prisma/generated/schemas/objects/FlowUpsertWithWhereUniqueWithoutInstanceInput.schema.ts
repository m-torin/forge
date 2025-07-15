import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateWithoutInstanceInputObjectSchema } from './FlowUpdateWithoutInstanceInput.schema';
import { FlowUncheckedUpdateWithoutInstanceInputObjectSchema } from './FlowUncheckedUpdateWithoutInstanceInput.schema';
import { FlowCreateWithoutInstanceInputObjectSchema } from './FlowCreateWithoutInstanceInput.schema';
import { FlowUncheckedCreateWithoutInstanceInputObjectSchema } from './FlowUncheckedCreateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => FlowUpdateWithoutInstanceInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutInstanceInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutInstanceInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpsertWithWhereUniqueWithoutInstanceInputObjectSchema = Schema;
