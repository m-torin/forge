import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewTypeSchema } from './ReviewTypeSchema';

export const EnumReviewTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumReviewTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ReviewTypeSchema).optional()
}).strict();

export default EnumReviewTypeFieldUpdateOperationsInputSchema;
