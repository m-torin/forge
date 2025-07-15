import { z } from 'zod';
import { InfrastructureWhereInputObjectSchema } from './InfrastructureWhereInput.schema';
import { InfrastructureUpdateWithoutNodesInputObjectSchema } from './InfrastructureUpdateWithoutNodesInput.schema';
import { InfrastructureUncheckedUpdateWithoutNodesInputObjectSchema } from './InfrastructureUncheckedUpdateWithoutNodesInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => InfrastructureWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => InfrastructureUpdateWithoutNodesInputObjectSchema),
      z.lazy(() => InfrastructureUncheckedUpdateWithoutNodesInputObjectSchema),
    ]),
  })
  .strict();

export const InfrastructureUpdateToOneWithWhereWithoutNodesInputObjectSchema =
  Schema;
