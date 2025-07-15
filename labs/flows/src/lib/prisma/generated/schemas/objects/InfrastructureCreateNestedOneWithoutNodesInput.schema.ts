import { z } from 'zod';
import { InfrastructureCreateWithoutNodesInputObjectSchema } from './InfrastructureCreateWithoutNodesInput.schema';
import { InfrastructureUncheckedCreateWithoutNodesInputObjectSchema } from './InfrastructureUncheckedCreateWithoutNodesInput.schema';
import { InfrastructureCreateOrConnectWithoutNodesInputObjectSchema } from './InfrastructureCreateOrConnectWithoutNodesInput.schema';
import { InfrastructureWhereUniqueInputObjectSchema } from './InfrastructureWhereUniqueInput.schema';

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
    connect: z
      .lazy(() => InfrastructureWhereUniqueInputObjectSchema)
      .optional(),
  })
  .strict();

export const InfrastructureCreateNestedOneWithoutNodesInputObjectSchema =
  Schema;
