import { z } from 'zod';
import { InfrastructureUpdateWithoutNodesInputObjectSchema } from './InfrastructureUpdateWithoutNodesInput.schema';
import { InfrastructureUncheckedUpdateWithoutNodesInputObjectSchema } from './InfrastructureUncheckedUpdateWithoutNodesInput.schema';
import { InfrastructureCreateWithoutNodesInputObjectSchema } from './InfrastructureCreateWithoutNodesInput.schema';
import { InfrastructureUncheckedCreateWithoutNodesInputObjectSchema } from './InfrastructureUncheckedCreateWithoutNodesInput.schema';
import { InfrastructureWhereInputObjectSchema } from './InfrastructureWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => InfrastructureUpdateWithoutNodesInputObjectSchema),
      z.lazy(() => InfrastructureUncheckedUpdateWithoutNodesInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => InfrastructureCreateWithoutNodesInputObjectSchema),
      z.lazy(() => InfrastructureUncheckedCreateWithoutNodesInputObjectSchema),
    ]),
    where: z.lazy(() => InfrastructureWhereInputObjectSchema).optional(),
  })
  .strict();

export const InfrastructureUpsertWithoutNodesInputObjectSchema = Schema;
