import { z } from 'zod';
import { FlowUpdateWithoutEdgesInputObjectSchema } from './FlowUpdateWithoutEdgesInput.schema';
import { FlowUncheckedUpdateWithoutEdgesInputObjectSchema } from './FlowUncheckedUpdateWithoutEdgesInput.schema';
import { FlowCreateWithoutEdgesInputObjectSchema } from './FlowCreateWithoutEdgesInput.schema';
import { FlowUncheckedCreateWithoutEdgesInputObjectSchema } from './FlowUncheckedCreateWithoutEdgesInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutEdgesInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutEdgesInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutEdgesInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutEdgesInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutEdgesInputObjectSchema = Schema;
