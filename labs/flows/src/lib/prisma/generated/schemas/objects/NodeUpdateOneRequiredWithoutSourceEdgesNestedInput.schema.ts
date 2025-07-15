import { z } from 'zod';
import { NodeCreateWithoutSourceEdgesInputObjectSchema } from './NodeCreateWithoutSourceEdgesInput.schema';
import { NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutSourceEdgesInput.schema';
import { NodeCreateOrConnectWithoutSourceEdgesInputObjectSchema } from './NodeCreateOrConnectWithoutSourceEdgesInput.schema';
import { NodeUpsertWithoutSourceEdgesInputObjectSchema } from './NodeUpsertWithoutSourceEdgesInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateToOneWithWhereWithoutSourceEdgesInputObjectSchema } from './NodeUpdateToOneWithWhereWithoutSourceEdgesInput.schema';
import { NodeUpdateWithoutSourceEdgesInputObjectSchema } from './NodeUpdateWithoutSourceEdgesInput.schema';
import { NodeUncheckedUpdateWithoutSourceEdgesInputObjectSchema } from './NodeUncheckedUpdateWithoutSourceEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutSourceEdgesInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutSourceEdgesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => NodeCreateOrConnectWithoutSourceEdgesInputObjectSchema)
      .optional(),
    upsert: z
      .lazy(() => NodeUpsertWithoutSourceEdgesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(
          () => NodeUpdateToOneWithWhereWithoutSourceEdgesInputObjectSchema,
        ),
        z.lazy(() => NodeUpdateWithoutSourceEdgesInputObjectSchema),
        z.lazy(() => NodeUncheckedUpdateWithoutSourceEdgesInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NodeUpdateOneRequiredWithoutSourceEdgesNestedInputObjectSchema =
  Schema;
