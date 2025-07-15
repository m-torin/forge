import { z } from 'zod';
import { NodeCreateWithoutTargetEdgesInputObjectSchema } from './NodeCreateWithoutTargetEdgesInput.schema';
import { NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema } from './NodeUncheckedCreateWithoutTargetEdgesInput.schema';
import { NodeCreateOrConnectWithoutTargetEdgesInputObjectSchema } from './NodeCreateOrConnectWithoutTargetEdgesInput.schema';
import { NodeUpsertWithoutTargetEdgesInputObjectSchema } from './NodeUpsertWithoutTargetEdgesInput.schema';
import { NodeWhereUniqueInputObjectSchema } from './NodeWhereUniqueInput.schema';
import { NodeUpdateToOneWithWhereWithoutTargetEdgesInputObjectSchema } from './NodeUpdateToOneWithWhereWithoutTargetEdgesInput.schema';
import { NodeUpdateWithoutTargetEdgesInputObjectSchema } from './NodeUpdateWithoutTargetEdgesInput.schema';
import { NodeUncheckedUpdateWithoutTargetEdgesInputObjectSchema } from './NodeUncheckedUpdateWithoutTargetEdgesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => NodeCreateWithoutTargetEdgesInputObjectSchema),
        z.lazy(() => NodeUncheckedCreateWithoutTargetEdgesInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => NodeCreateOrConnectWithoutTargetEdgesInputObjectSchema)
      .optional(),
    upsert: z
      .lazy(() => NodeUpsertWithoutTargetEdgesInputObjectSchema)
      .optional(),
    connect: z.lazy(() => NodeWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(
          () => NodeUpdateToOneWithWhereWithoutTargetEdgesInputObjectSchema,
        ),
        z.lazy(() => NodeUpdateWithoutTargetEdgesInputObjectSchema),
        z.lazy(() => NodeUncheckedUpdateWithoutTargetEdgesInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NodeUpdateOneRequiredWithoutTargetEdgesNestedInputObjectSchema =
  Schema;
