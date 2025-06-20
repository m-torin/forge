import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';

export const EnumContentStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumContentStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ContentStatusSchema).optional()
}).strict();

export default EnumContentStatusFieldUpdateOperationsInputSchema;
