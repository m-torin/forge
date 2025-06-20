import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereInputSchema } from './JrFindReplaceRejectWhereInputSchema';

export const JrFindReplaceRejectListRelationFilterSchema: z.ZodType<Prisma.JrFindReplaceRejectListRelationFilter> = z.object({
  every: z.lazy(() => JrFindReplaceRejectWhereInputSchema).optional(),
  some: z.lazy(() => JrFindReplaceRejectWhereInputSchema).optional(),
  none: z.lazy(() => JrFindReplaceRejectWhereInputSchema).optional()
}).strict();

export default JrFindReplaceRejectListRelationFilterSchema;
