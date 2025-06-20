import type { Prisma } from '../../client';

import { z } from 'zod';
import { VoteTypeSchema } from './VoteTypeSchema';

export const EnumVoteTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumVoteTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => VoteTypeSchema).optional()
}).strict();

export default EnumVoteTypeFieldUpdateOperationsInputSchema;
