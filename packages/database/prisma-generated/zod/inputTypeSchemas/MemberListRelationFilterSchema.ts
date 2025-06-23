import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberWhereInputSchema } from './MemberWhereInputSchema';

export const MemberListRelationFilterSchema: z.ZodType<Prisma.MemberListRelationFilter> = z
  .object({
    every: z.lazy(() => MemberWhereInputSchema).optional(),
    some: z.lazy(() => MemberWhereInputSchema).optional(),
    none: z.lazy(() => MemberWhereInputSchema).optional(),
  })
  .strict();

export default MemberListRelationFilterSchema;
