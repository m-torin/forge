import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrRuleActionSchema } from './JrRuleActionSchema';

export const EnumJrRuleActionFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumJrRuleActionFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => JrRuleActionSchema).optional()
}).strict();

export default EnumJrRuleActionFieldUpdateOperationsInputSchema;
