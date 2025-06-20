import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';

export const JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInputSchema: z.ZodType<Prisma.JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInput> = z.object({
  jollyRogerId: z.number(),
  fieldName: z.lazy(() => JrChartRuleForSchema)
}).strict();

export default JrExtractionRuleJollyRogerIdFieldNameCompoundUniqueInputSchema;
