import { z } from 'zod';
import { FlowUpdateWithoutTagsInputObjectSchema } from './FlowUpdateWithoutTagsInput.schema';
import { FlowUncheckedUpdateWithoutTagsInputObjectSchema } from './FlowUncheckedUpdateWithoutTagsInput.schema';
import { FlowCreateWithoutTagsInputObjectSchema } from './FlowCreateWithoutTagsInput.schema';
import { FlowUncheckedCreateWithoutTagsInputObjectSchema } from './FlowUncheckedCreateWithoutTagsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutTagsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutTagsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutTagsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutTagsInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutTagsInputObjectSchema = Schema;
