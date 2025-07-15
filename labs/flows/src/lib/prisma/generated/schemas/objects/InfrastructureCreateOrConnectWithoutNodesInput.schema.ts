import { z } from 'zod';
import { InfrastructureWhereUniqueInputObjectSchema } from './InfrastructureWhereUniqueInput.schema';
import { InfrastructureCreateWithoutNodesInputObjectSchema } from './InfrastructureCreateWithoutNodesInput.schema';
import { InfrastructureUncheckedCreateWithoutNodesInputObjectSchema } from './InfrastructureUncheckedCreateWithoutNodesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InfrastructureWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => InfrastructureCreateWithoutNodesInputObjectSchema),
      z.lazy(() => InfrastructureUncheckedCreateWithoutNodesInputObjectSchema),
    ]),
  })
  .strict();

export const InfrastructureCreateOrConnectWithoutNodesInputObjectSchema =
  Schema;
