import { z } from 'zod';
import { FlowCreateWithoutEdgesInputObjectSchema } from './FlowCreateWithoutEdgesInput.schema';
import { FlowUncheckedCreateWithoutEdgesInputObjectSchema } from './FlowUncheckedCreateWithoutEdgesInput.schema';
import { FlowCreateOrConnectWithoutEdgesInputObjectSchema } from './FlowCreateOrConnectWithoutEdgesInput.schema';
import { FlowUpsertWithoutEdgesInputObjectSchema } from './FlowUpsertWithoutEdgesInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutEdgesInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutEdgesInput.schema';
import { FlowUpdateWithoutEdgesInputObjectSchema } from './FlowUpdateWithoutEdgesInput.schema';
import { FlowUncheckedUpdateWithoutEdgesInputObjectSchema } from './FlowUncheckedUpdateWithoutEdgesInput.schema';

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
    upsert: z.lazy(() => FlowUpsertWithoutEdgesInputObjectSchema).optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => FlowUpdateToOneWithWhereWithoutEdgesInputObjectSchema),
        z.lazy(() => FlowUpdateWithoutEdgesInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutEdgesInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneRequiredWithoutEdgesNestedInputObjectSchema = Schema;
