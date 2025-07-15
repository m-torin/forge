import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutTagsInputObjectSchema } from './FlowCreateWithoutTagsInput.schema';
import { FlowUncheckedCreateWithoutTagsInputObjectSchema } from './FlowUncheckedCreateWithoutTagsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutTagsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutTagsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutTagsInputObjectSchema = Schema;
