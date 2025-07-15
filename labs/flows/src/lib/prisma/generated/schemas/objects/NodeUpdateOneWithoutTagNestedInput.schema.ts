import { z } from 'zod';
import { NodeCreateWithoutTagInputObjectSchema } from './NodeCreateWithoutTagInput.schema';
import { NodeUncheckedCreateWithoutTagInputObjectSchema } from './NodeUncheckedCreateWithoutTagInput.schema';
import { NodeCreateOrConnectWithoutTagInputObjectSchema } from './NodeCreateOrConnectWithoutTagInput.schema';
import { NodeUpsertWithoutTagInputObjectSchema } from './NodeUpsertWithoutTagInput.schema';
import { NodeWhereInputObjectSchema } from './NodeWhereInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateToOneWithWhereWithoutTagInputObjectSchema } from './NodeUpdateToOneWithWhereWithoutTagInput.schema';
import { NodeUpdateWithoutTagInputObjectSchema } from './NodeUpdateWithoutTagInput.schema';
import { NodeUncheckedUpdateWithoutTagInputObjectSchema } from './NodeUncheckedUpdateWithoutTagInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutTagInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutTagInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => NodeCreateOrConnectWithoutTagInputObjectSchema)
      .optional(),
    upsert: z.lazy(() => NodeUpsertWithoutTagInputObjectSchema).optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => NodeWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => NodeWhereInputObjectSchema)])
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(() => NodeUpdateToOneWithWhereWithoutTagInputObjectSchema),
        z.lazy(() => NodeUpdateWithoutTagInputObjectSchema),
        z.lazy(() => NodeUncheckedUpdateWithoutTagInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NodeUpdateOneWithoutTagNestedInputObjectSchema = Schema;
