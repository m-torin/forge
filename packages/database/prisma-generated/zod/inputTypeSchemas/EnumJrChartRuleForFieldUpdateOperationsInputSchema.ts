import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrChartRuleForSchema } from './JrChartRuleForSchema';

export const EnumJrChartRuleForFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumJrChartRuleForFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => JrChartRuleForSchema).optional()
}).strict();

export default EnumJrChartRuleForFieldUpdateOperationsInputSchema;
