import { z } from 'zod';
import { FlowCreateWithoutTagsInputObjectSchema } from './FlowCreateWithoutTagsInput.schema';
import { FlowUncheckedCreateWithoutTagsInputObjectSchema } from './FlowUncheckedCreateWithoutTagsInput.schema';
import { FlowCreateOrConnectWithoutTagsInputObjectSchema } from './FlowCreateOrConnectWithoutTagsInput.schema';
import { FlowUpsertWithoutTagsInputObjectSchema } from './FlowUpsertWithoutTagsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutTagsInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutTagsInput.schema';
import { FlowUpdateWithoutTagsInputObjectSchema } from './FlowUpdateWithoutTagsInput.schema';
import { FlowUncheckedUpdateWithoutTagsInputObjectSchema } from './FlowUncheckedUpdateWithoutTagsInput.schema';

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
    upsert: z.lazy(() => FlowUpsertWithoutTagsInputObjectSchema).optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => FlowWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => FlowWhereInputObjectSchema)])
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateToOneWithWhereWithoutTagsInputObjectSchema),
        z.lazy(() => FlowUpdateWithoutTagsInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutTagsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneWithoutTagsNestedInputObjectSchema = Schema;
