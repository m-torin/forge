import { z } from 'zod';
import { FlowCreateWithoutTagsInputObjectSchema } from './FlowCreateWithoutTagsInput.schema';
import { FlowUncheckedCreateWithoutTagsInputObjectSchema } from './FlowUncheckedCreateWithoutTagsInput.schema';
import { FlowCreateOrConnectWithoutTagsInputObjectSchema } from './FlowCreateOrConnectWithoutTagsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutTagsInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutTagsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutTagsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutTagsInputObjectSchema = Schema;
