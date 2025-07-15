import { z } from 'zod';
import { InfrastructureSelectObjectSchema } from './InfrastructureSelect.schema';
import { InfrastructureIncludeObjectSchema } from './InfrastructureInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => InfrastructureSelectObjectSchema).optional(),
    include: z.lazy(() => InfrastructureIncludeObjectSchema).optional(),
  })
  .strict();

export const InfrastructureArgsObjectSchema = Schema;
