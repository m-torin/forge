import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateWithoutInstanceInputObjectSchema } from './FlowUpdateWithoutInstanceInput.schema';
import { FlowUncheckedUpdateWithoutInstanceInputObjectSchema } from './FlowUncheckedUpdateWithoutInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutInstanceInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutInstanceInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateWithWhereUniqueWithoutInstanceInputObjectSchema = Schema;
