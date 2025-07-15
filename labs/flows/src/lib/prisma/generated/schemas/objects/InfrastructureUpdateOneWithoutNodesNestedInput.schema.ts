import { z } from 'zod';
import { InfrastructureCreateWithoutNodesInputObjectSchema } from './InfrastructureCreateWithoutNodesInput.schema';
import { InfrastructureUncheckedCreateWithoutNodesInputObjectSchema } from './InfrastructureUncheckedCreateWithoutNodesInput.schema';
import { InfrastructureCreateOrConnectWithoutNodesInputObjectSchema } from './InfrastructureCreateOrConnectWithoutNodesInput.schema';
import { InfrastructureUpsertWithoutNodesInputObjectSchema } from './InfrastructureUpsertWithoutNodesInput.schema';
import { InfrastructureWhereInputObjectSchema } from './InfrastructureWhereInput.schema';
import { InfrastructureWhereUniqueInputObjectSchema } from './InfrastructureWhereUniqueInput.schema';
import { InfrastructureUpdateToOneWithWhereWithoutNodesInputObjectSchema } from './InfrastructureUpdateToOneWithWhereWithoutNodesInput.schema';
import { InfrastructureUpdateWithoutNodesInputObjectSchema } from './InfrastructureUpdateWithoutNodesInput.schema';
import { InfrastructureUncheckedUpdateWithoutNodesInputObjectSchema } from './InfrastructureUncheckedUpdateWithoutNodesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => InfrastructureCreateWithoutNodesInputObjectSchema),
        z.lazy(
          () => InfrastructureUncheckedCreateWithoutNodesInputObjectSchema,
        ),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => InfrastructureCreateOrConnectWithoutNodesInputObjectSchema)
      .optional(),
    upsert: z
      .lazy(() => InfrastructureUpsertWithoutNodesInputObjectSchema)
      .optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => InfrastructureWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => InfrastructureWhereInputObjectSchema)])
      .optional(),
    connect: z
      .lazy(() => InfrastructureWhereUniqueInputObjectSchema)
      .optional(),
    update: z
      .union([
        z.lazy(
          () => InfrastructureUpdateToOneWithWhereWithoutNodesInputObjectSchema,
        ),
        z.lazy(() => InfrastructureUpdateWithoutNodesInputObjectSchema),
        z.lazy(
          () => InfrastructureUncheckedUpdateWithoutNodesInputObjectSchema,
        ),
      ])
      .optional(),
  })
  .strict();

export const InfrastructureUpdateOneWithoutNodesNestedInputObjectSchema =
  Schema;
