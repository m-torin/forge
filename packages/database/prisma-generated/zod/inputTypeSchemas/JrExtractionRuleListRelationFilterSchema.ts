import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrExtractionRuleWhereInputSchema } from './JrExtractionRuleWhereInputSchema';

export const JrExtractionRuleListRelationFilterSchema: z.ZodType<Prisma.JrExtractionRuleListRelationFilter> = z.object({
  every: z.lazy(() => JrExtractionRuleWhereInputSchema).optional(),
  some: z.lazy(() => JrExtractionRuleWhereInputSchema).optional(),
  none: z.lazy(() => JrExtractionRuleWhereInputSchema).optional()
}).strict();

export default JrExtractionRuleListRelationFilterSchema;
